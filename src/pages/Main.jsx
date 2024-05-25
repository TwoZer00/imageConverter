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
          <InputFile files={[files, setFiles]} converter={convert} loading={files.some(item => item.loading)} />
          <FileList files={[files, setFiles]} />
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
        sx={{ '& .MuiInput-root:before': { border: 'none' }, '& .MuiInput-root:hover:before': { border: 'none' } }}
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
  const theme = useTheme()
  const fileInputRef = useRef(null)
  const handleChange = (e) => {
    const InputFiles = Array.from(e.target.files)
    const temp = [...data, ...InputFiles]
    if (temp.length > 5) {
      setData(temp.slice(0, 5))
      return alert('max 5 file at same time')
    }
    if (temp.some(item => getSizeNumber(item.size) >= 5)) {
      setData(temp.filter(item => getSizeNumber(item.size) < 5))
      return alert('file size must not be greater than 5MB')
    }
    setData(temp)
  }
  const handleClear = () => {
    setData([])
    fileInputRef.current.value = ''
  }
  return (
    <Box sx={{ py: 2, position: 'fixed', backgroundColor: `${alpha(theme.palette.background.default, 0.25)}`, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, left: 0, top: 0, flexDirection: 'column', backdropFilter: 'blur(5px)', border: 1, borderColor: theme.palette.divider, borderLeft: 0, borderRight: 0, borderTop: 0 }}>
      <Stack direction='row' gap={1}>
        <input accept='image/png,image/jpg,image/jpeg' type='file' multiple hidden id='input-file' onChange={handleChange} ref={fileInputRef} />
        <Stack component='label' htmlFor='input-file'>
          <Button startIcon={<Upload />} variant='contained' sx={{ textWrap: 'nowrap', width: 'fit-content' }} component='span' role='button'>
            Load Files
          </Button>
        </Stack>
        <Button
          disabled={data.length === 0} variant='contained' sx={{ textWrap: 'nowrap', width: 'fit-content', height: 'fit-content' }} startIcon={<Delete />} onClick={handleClear}
        >
          Clear all
        </Button>
        <Button startIcon={<Compare />} variant='contained' sx={{ width: 'fit-content' }} disabled={data.length === 0} onClick={() => { converter() }}>
          Convert {data.length > 1 && 'all'}
        </Button>
      </Stack>
    </Box>
  )
}
const FileList = ({ files }) => {
  const theme = useTheme()
  const [data, setData] = files
  const loading = data.some(item => item.loading)
  const handleClick = (index) => {
    data.splice(index, 1)
    setData([...data])
  }
  return (
    <Box height='100%' flex='auto' width='100%' overflow='auto' pt={9} pb={1}>
      <Box mt={0.6} mb={2} position='sticky' sx={{ top: 5, zIndex: 1 }}>
        {loading && <LinearProgress sx={{ width: '100%' }} />}
      </Box>
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
