import { PropTypes } from 'prop-types'
import { useRef, useState } from 'react'
import { Box, Stack, Button, CssBaseline, ThemeProvider, createTheme, Typography, IconButton, useTheme, alpha, LinearProgress, Tooltip, Chip } from '@mui/material'
import Masonry from '@mui/lab/Masonry'
import { Delete, Download } from '@mui/icons-material'
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
      fetch(API_URL, { method: 'POST', body: formData }).then((res) => res.blob()).then((blob) => {
        item.fileconverted = blob // save blob to item
        item.downloable = true
        item.loading = false
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
          <Button variant='contained' sx={{ textWrap: 'nowrap', width: 'fit-content' }} component='span' role='button'>
            Load Files
          </Button>
        </Stack>
        <Button
          disabled={data.length === 0} variant='contained' sx={{ textWrap: 'nowrap', width: 'fit-content', height: 'fit-content' }} startIcon={<Delete />} onClick={handleClear}
        >
          Clear all
        </Button>
        <Button variant='contained' sx={{ width: 'fit-content' }} disabled={data.length === 0} onClick={() => { converter() }}>
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
            <Stack direction='row' alignItems='center'>
              <Tooltip title={file.name}>
                <Typography variant='body1' maxWidth='100%' flex={1} noWrap>{file.name || 'no filename'}</Typography>
              </Tooltip>
            </Stack>
            <Box position='relative'>
              <img src={URL.createObjectURL(file.fileconverted || file)} alt={file.name} style={{ height: 'auto', width: '100%', objectFit: 'contain' }} />
              {file.fileconverted && <Chip sx={{ m: 2, position: 'absolute', right: 0, top: 0, zIndex: 1, textTransform: 'uppercase' }} color='secondary' size='small' variant='contained' label='webm' />}
            </Box>
            <Typography variant='caption' textAlign='center' display='block'>{getSize(file.size)}</Typography>
            <Stack direction='row' justifyContent='flex-end' alignItems='center'>
              <IconButton disabled={!file.downloable} size='small' component='a' href={file.fileconverted && URL.createObjectURL(file.fileconverted)} download>
                <Download />
              </IconButton>
              <IconButton size='small' onClick={() => handleClick(index)}>
                <Delete />
              </IconButton>
            </Stack>
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
const getSize = (size) => {
  const kb = size / 1024
  const mb = kb / 1024
  return (mb > 1) ? `${mb.toFixed(2)} Mb` : `${kb.toFixed(2)} Kb`
}
