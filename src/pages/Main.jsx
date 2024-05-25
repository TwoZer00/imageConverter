import { PropTypes } from 'prop-types'
import { useState } from 'react'
import { Box, Stack, Button, CssBaseline, ThemeProvider, createTheme, Typography, IconButton, useTheme, alpha } from '@mui/material'
import { Close, Delete } from '@mui/icons-material'

export default function Main () {
  const theme = createTheme()
  const [files, setFiles] = useState([])
  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Stack maxWidth='100dvw' p={1} height='100dvh'>
          <InputFile files={[files, setFiles]} />
          <FileList files={[files, setFiles]} />
        </Stack>
      </ThemeProvider>
    </>
  )
}

const InputFile = ({ files }) => {
  const [data, setData] = files
  const theme = useTheme()
  const handleChange = (e) => {
    const InputFiles = Array.from(e.target.files)
    const temp = [...data, ...InputFiles]
    if (temp.length > 5) {
      setData(temp.slice(0, 5))
      return alert('max 5 file at same time')
    }
    setData(temp)
  }
  return (
    <Box sx={{ py: 1, position: 'fixed', backgroundColor: `${alpha(theme.palette.background.default, 0.1)}`, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, left: 0, top: 0, flexDirection: 'column', backdropFilter: 'blur(5px)', border: 1, borderRadius: 1, borderColor: theme.palette.divider, borderLeft: 0, borderRight: 0, borderTop: 0 }}>
      <Stack direction='row' gap={1}>
        <input type='file' multiple hidden id='input-file' onChange={handleChange} />
        <Stack component='label' htmlFor='input-file'>
          <Button variant='contained' sx={{ textWrap: 'nowrap', width: 'fit-content' }} component='span' role='button'>
            Load Files
          </Button>
        </Stack>
        <Button disabled={data.length === 0} variant='contained' sx={{ textWrap: 'nowrap', width: 'fit-content', height: 'fit-content' }} startIcon={<Delete />} onClick={() => setData([])}>
          Clear all
        </Button>
        <Button variant='contained' sx={{ width: 'fit-content' }} disabled={data.length === 0}>
          Convert all
        </Button>
      </Stack>
      <Typography variant='caption' align='center' mt={1} display='block' sx={{ ':first-letter': { textTransform: 'uppercase' } }}>max 5 files at same time.</Typography>
    </Box>
  )
}
const FileList = ({ files }) => {
  const [data, setData] = files
  const handleClick = (index) => {
    data.splice(index, 1)
    setData([...data])
  }
  return (
    <Box height='100%' flex='auto' width='100%' maxWidth='md' mx='auto' mt={9}>
      <Stack direction='column' overflow='auto'>
        {data.map((file, index) => (
          <Stack direction='column' key={index} flex={1} width='200px'>
            <Stack direction='row' alignItems='center'>
              <Typography variant='body1' maxWidth='100%' noWrap>{file.name || 'no filename'}</Typography>
              <IconButton onClick={() => handleClick(index)} sx={{ zIndex: 1, placeSelf: 'flex-end' }}>
                <Close />
              </IconButton>
            </Stack>
            <img src={URL.createObjectURL(file)} alt={file.name} style={{ height: '200px', width: '200px', objectFit: 'contain' }} />
            <Typography variant='caption' textAlign='center'>{getSize(file.size)}</Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  )
}
InputFile.propTypes = {
  files: PropTypes.array.isRequired
}
FileList.propTypes = {
  files: PropTypes.array.isRequired
}

const getSize = (size) => {
  const kb = size / 1024
  const mb = kb / 1024
  return (mb > 1) ? `${mb.toFixed(2)} Mb` : `${kb.toFixed(2)} Kb`
}
