import { PropTypes } from 'prop-types'
import { useRef, useState } from 'react'
import { Box, Stack, Button, CssBaseline, ThemeProvider, createTheme, Typography, IconButton, useTheme, alpha, LinearProgress, Chip, TextField, InputAdornment, Tooltip } from '@mui/material'
import Masonry from '@mui/lab/Masonry'
import { Close, Compare, Delete, Download, Upload } from '@mui/icons-material'
const API_URL = 'https://image-converter-k56z.onrender.com/api/image/converter'
export default function Main () {
  const theme = createTheme()
  const [files, setFiles] = useState([])
  const convert = () => {
    const temp = [...files]
    temp.forEach((item, index) => {
      const formData = new FormData()
      formData.append('image', item)
      setFiles((val) => {
        const temp = [...val]
        temp[index] = item
        return temp
      })
      if (item.fileconverted) {
        return // work as continue
      }
      item.loading = true
      fetch(API_URL, { method: 'POST', body: formData }).then(async (res) => {
        if (res.status !== 200) {
          throw new Error((await res.json()).message)
        }
        return res.blob()
      }).then((blob) => {
        item.fileconverted = blob // save blob to item
        item.downloable = true
        item.loading = false
        setFiles((val) => {
          const temp = [...val]
          temp[index] = item
          return temp
        })
      }).catch((error) => {
        item.loading = false
        item.error = error.message
        setFiles((val) => {
          const temp = [...val]
          temp[index] = item
          return temp
        })
      })
    })
  }
  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Stack maxWidth='100dvw' height='100dvh'>
          <Stack component='header' direction='column' alignItems='center' mt={1}>
            <Typography variant='h1' fontSize={32} fontWeight={400} textTransform='uppercase'>Image converter</Typography>
            <Typography variant='subtitle1' fontSize={12}>Convert images(png, jpeg, jpg) to webm</Typography>
          </Stack>
          <Box component='main'>
            <Box sx={{ position: 'sticky', backgroundColor: `${alpha(theme.palette.background.default, 0.25)}`, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, left: 0, top: 0, flexDirection: 'column', backdropFilter: 'blur(5px)', border: 1, borderColor: theme.palette.divider, borderLeft: 0, borderRight: 0, borderTop: 0 }}>
              <InputFile files={[files, setFiles]} converter={convert} loading={files.some(item => item.loading)} />
            </Box>
            <FileList files={[files, setFiles]} />
          </Box>
        </Stack>
      </ThemeProvider>
    </>
  )
}
const InputFilename = ({ file, index }) => {
  const [data, setFiles] = file
  const inputRef = useRef(null)
  const [props, setProps] = useState({
    readOnly: true
  })
  const handleChange = (e) => {
    setFiles((val) => {
      const temp = [...val]
      temp[index].newName = e.target.value
      return temp
    })
  }
  return (
    <>
      <TextField
        fullWidth
        sx={{ '& .MuiInput-root:before': { border: 'none' }, '& .MuiInput-root:hover:before': { border: 'none' }, '& .MuiInputBase-root:hover:before': { border: 'none' } }}
        InputProps={props}
        inputProps={{ ref: inputRef, autoComplete: 'off' }}
        defaultValue={data.newName}
        placeholder={data.name}
        onChange={handleChange}
        variant='standard'
        onBlur={() => {
          setProps((val) => {
            const temp = { ...val }
            temp.readOnly = true
            delete temp.endAdornment
            return temp
          })
        }}
        onFocus={() => {
          setProps((val) => {
            const temp = { ...val }
            temp.readOnly = false
            temp.endAdornment = <CloseCustomButton inputRef={inputRef} setFiles={setFiles} index={index} />
            return temp
          })
        }}
      />
    </>
  )
}
const CloseCustomButton = (props) => {
  return (
    <InputAdornment position='end'>
      <IconButton
        size='small' onClick={() => {
          props.inputRef.current.value = ''
          props.setFiles((val) => {
            const temp = [...val]
            delete temp[props.index].newName
            return temp
          })
        }}
      >
        <Close />
      </IconButton>
    </InputAdornment>
  )
}
const InputFile = ({ files, converter }) => {
  const [data, setData] = files
  const fileInputRef = useRef(null)
  const loading = data.some(item => item.loading)
  const handleChange = (e) => {
    const InputFiles = Array.from(e.target.files)
    const temp = [...data, ...InputFiles]
    if (temp.filter(item => !item.fileconverted).length > 5) {
      setData([...temp.filter(item => item.fileconverted), ...temp.filter(item => !item.fileconverted).slice(0, 5)])
      return alert('max 5 file at same time')
    }
    if (temp.some(item => getSizeNumber(item.size) >= 5)) {
      setData(temp.filter(item => getSizeNumber(item.size) < 5))
      return alert('file size must not be greater than 5MB')
    }
    setData(temp)
  }
  const handleClear = () => {
    if (window.confirm('Are you sure to clear all files?')) {
      setData([])
      fileInputRef.current.value = ''
    }
  }
  return (
    <Box width='100%'>
      <Stack mx='auto' my={1} width='fit-content' direction='row' gap={1} flexWrap='wrap' justifyContent='space-around'>
        <input accept='image/png,image/jpg,image/jpeg' type='file' multiple hidden id='input-file' onChange={handleChange} ref={fileInputRef} />
        <Button
          disabled={data.length === 0} variant='contained' color='error' sx={{ textWrap: 'nowrap', width: 'fit-content', height: 'fit-content' }} startIcon={<Delete />} onClick={handleClear}
        >
          Clear all
        </Button>
        <Stack component='label' htmlFor='input-file'>
          <Button startIcon={<Upload />} variant='contained' sx={{ textWrap: 'nowrap', width: 'fit-content' }} component='span' role='button'>
            Load Files
          </Button>
        </Stack>
        <Button startIcon={<Compare />} variant='contained' sx={{ width: 'fit-content', textWrap: 'nowrap' }} disabled={data.length === 0 || loading} onClick={() => { converter() }}>
          Convert {data.length > 1 && 'all'}
        </Button>
      </Stack>
      <LinearProgress sx={{ width: '100%', visibility: `${!loading && 'hidden'}` }} />
    </Box>
  )
}
const FileList = ({ files }) => {
  const theme = useTheme()
  const [data, setData] = files
  const handleClick = (index) => {
    data.splice(index, 1)
    setData([...data])
  }
  return (
    <Box height='100%' flex='auto' width='100%' mt={2}>
      <Masonry columns={2} spacing={4} sx={{ maxWidth: 'xl', width: '100%', mx: 'auto', p: 1 }}>
        {data.map((file, index) => (
          <Box key={index} width='200px' border={1} p={2} boxSizing='content-box' borderRadius={2} borderColor={theme.palette.divider}>
            <Stack direction='row' alignItems='center' mb={1}>
              <InputFilename file={[file, setData]} index={index} placeholder={file.name || 'no filename'} />
            </Stack>
            <Box position='relative'>
              <img src={URL.createObjectURL(file.fileconverted || file)} alt={file.name} style={{ height: 'auto', width: '100%', objectFit: 'contain' }} />
              {file.fileconverted && <Chip sx={{ m: 2, position: 'absolute', right: 0, top: 0, zIndex: 1, textTransform: 'uppercase' }} color='secondary' size='small' variant='contained' label='webm' />}
            </Box>
            <Tooltip title={`${getSizeNumber(file.size) > 5 ? 'File exceeds 5Mb' : ''}`}>
              <Typography variant='caption' color={`${getSizeNumber(file.size) > 5 ? 'crimson' : 'inherit'}`} textAlign='center' display='block'>{getSize(file.size)}</Typography>
            </Tooltip>
            <Stack direction='row' justifyContent='flex-end' alignItems='center'>
              <IconButton disabled={!file.downloable} size='small' component='a' href={file.fileconverted && URL.createObjectURL(file.fileconverted)} download={file.newName?.replace(' ', '-') || true}>
                <Download />
              </IconButton>
              <IconButton size='small' onClick={() => handleClick(index)}>
                <Delete />
              </IconButton>
            </Stack>
            {file.error && <Typography variant='subtitle1' color='crimson' textAlign='center' display='block'>{file.error}</Typography>}
          </Box>
        ))}
      </Masonry>
    </Box>
  )
}
InputFile.propTypes = {
  files: PropTypes.array.isRequired,
  converter: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired
}
FileList.propTypes = {
  files: PropTypes.array.isRequired
}
InputFilename.propTypes = {
  file: PropTypes.array.isRequired,
  index: PropTypes.number.isRequired
}
CloseCustomButton.propTypes = {
  inputRef: PropTypes.object.isRequired,
  setFiles: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired
}
const getSize = (size) => {
  const kb = size / 1024
  const mb = kb / 1024
  return (mb > 1) ? `${mb.toFixed(2)} Mb` : `${kb.toFixed(2)} Kb`
}
const getSizeNumber = (size) => {
  const kb = size / 1024
  const mb = kb / 1024
  return mb.toFixed(2)
}
