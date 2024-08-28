import { PropTypes } from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import { Box, Stack, Button, CssBaseline, ThemeProvider, createTheme, Typography, IconButton, useTheme, alpha, LinearProgress, Chip, TextField, InputAdornment, Tooltip, Menu, MenuItem, ListItemIcon, ButtonGroup, Snackbar, Slide, Alert, Link } from '@mui/material'
import Masonry from '@mui/lab/Masonry'
import { ChecklistRtl, Clear, Close, CloudDoneOutlined, CloudOffOutlined, CloudSyncOutlined, Compare, Delete, Download, ErrorOutline, MoreVert, Rule, Upload } from '@mui/icons-material'
import { getAnalytics, logEvent } from 'firebase/analytics'
import { useCursor } from '../hooks/useCursor'
const API_URL_BASE = (import.meta.env.VITE_API_URL_DEV || 'https://image-converter-k56z.onrender.com')
const API_URL = `${API_URL_BASE}/api/image/converter`
const requestStateEnum = {
  none: 0,
  loading: 1,
  done: 2,
  error: 3,
  stillLoading: 4
}
export default function Main () {
  const theme = createTheme()
  const [, setCursor] = useCursor()
  const [files, setFiles] = useState([])
  const fileInputRef = useRef()
  const [requestState, setRequestState] = useState(requestStateEnum.none)
  const convert = () => {
    setRequestState(requestStateEnum.loading)
    setCursor('wait')
    const temp = [...files]
    const promises = []
    for (const item of temp) {
      if (item.fileconverted || item.error) {
        continue
      }
      const promise = new Promise((resolve, reject) => {
        const formData = new FormData()
        formData.append('image', item)
        fetch(API_URL, { method: 'POST', body: formData }).then(async (res) => {
          if (!res.ok) {
            item.error = (await res.json()).message
            throw new Error(item.error)
          }
          return res.blob()
        }).then((blob) => {
          item.fileconverted = blob // save blob to item
          item.downloable = true
          resolve(item)
        }).catch((error) => {
          console.error(error.message)
          reject(error.message)
        })
      })
      promises.push(promise)
    }
    // check if petition is taking more than 30 secs
    const timeOut = setTimeout(() => {
      setRequestState(requestStateEnum.stillLoading)
    }, 30000)
    Promise.allSettled(promises).then((values) => {
      if (!import.meta.env.VITE_ENV) {
        logEvent(getAnalytics(), 'convert_image', {
          convertedFiles: values.length,
          totalFiles: files.length
        })
      }
    }).catch((error) => {
      console.error(error)
      setRequestState(requestStateEnum.error)
      if (!import.meta.env.VITE_ENV) {
        logEvent(getAnalytics(), 'convert_image_error', {
          error: error.message
        })
      }
      return error
    }).finally(() => {
      clearTimeout(timeOut)
      setCursor('auto')
      setRequestState(requestStateEnum.done)
      setTimeout(() => {
        setRequestState(requestStateEnum.none)
      }, 3000)
    })
  }
  useEffect(() => {
    if (('Notification' in window) && Notification.permission !== 'granted') {
      Notification.requestPermission()
    }
  }, [])
  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Stack maxWidth='100dvw' height='100dvh'>
          <Stack component='header' direction='column' alignItems='center' mt={1}>
            <Typography variant='h1' fontSize={32} fontWeight={400} textTransform='uppercase'>Image converter</Typography>
            <Typography variant='subtitle1' fontSize={12}>Convert images to webp</Typography>
          </Stack>
          <Box component='main'>
            <Box sx={{ position: 'sticky', backgroundColor: `${alpha(theme.palette.background.default, 0.25)}`, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, left: 0, top: 0, flexDirection: 'column', backdropFilter: 'blur(5px)', border: 1, borderColor: theme.palette.divider, borderLeft: 0, borderRight: 0, borderTop: 0 }}>
              <InputFile files={[files, setFiles]} inputRef={fileInputRef} converter={convert} loading={requestState === requestStateEnum.loading || requestState === requestStateEnum.stillLoading} requestState={requestState} />
            </Box>
            <FileList files={[files, setFiles]} inputRef={fileInputRef} />
          </Box>
          <Box component='footer' position='fixed' width='100%' sx={{ bottom: 0, backgroundColor: theme.palette.background.default }}>
            <Typography variant='body2' textAlign='center'>
              Made with ❤️ by &copy;
              <Link href='https://twozer00.dev' target='_blank' color='secondary'>
                <strong>TwoZer00</strong>
              </Link>
              {` ${new Date().getFullYear()}`}
            </Typography>
          </Box>
          <Snackbar
            open={requestStateEnum.stillLoading === requestState}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            TransitionComponent={Slide}
          >
            <Alert
              severity='warning'
              variant='filled'
              sx={{ width: '100%' }}
            >
              Service may take more than 50 seconds if not in use. <br />
            </Alert>
          </Snackbar>
        </Stack>
      </ThemeProvider>
    </>
  )
}
const InputFilename = ({ file, index, placeholder }) => {
  const [, setFiles] = file
  const [filename, setFilename] = useState('')
  const [props, setProps] = useState({
    readOnly: true
  })
  const handleChange = (e) => {
    setFilename(e.target.value)
    setFiles((val) => {
      const temp = [...val]
      temp[index].newName = e.target.value
      return temp
    })
  }

  useEffect(() => {
    if (filename.length > 0) {
      setProps((val) => {
        const temp = { ...val }
        temp.readOnly = false
        temp.endAdornment = <CloseCustomButton setFilename={setFilename} />
        return temp
      })
    } else {
      setProps((val) => {
        const temp = { ...val }
        temp.readOnly = true
        delete temp.endAdornment
        return temp
      })
      setFiles((val) => {
        const temp = [...val]
        delete temp[index].newName
        return temp
      })
    }
  }, [filename, index, setFiles])
  return (
    <>
      <TextField
        fullWidth
        sx={{ '& .MuiInput-root:hover:not(.Mui-disabled, .Mui-error):before': { border: 'none' }, '& .MuiInput-root:before': { border: 'none' } }}
        InputProps={props}
        inputProps={{ autoComplete: 'off' }}
        value={filename}
        placeholder={placeholder}
        onChange={handleChange}
        variant='standard'
        onBlur={() => {
          setProps((val) => {
            const temp = { ...val }
            temp.readOnly = true
            // delete temp.endAdornment
            return temp
          })
        }}
        onFocus={() => {
          setProps((val) => {
            const temp = { ...val }
            temp.readOnly = false
            return temp
          })
        }}
      />
    </>
  )
}
const CloseCustomButton = ({ setFilename }) => {
  return (
    <InputAdornment position='end'>
      <IconButton
        size='small' onClick={() => {
          setFilename('')
        }}
      >
        <Close />
      </IconButton>
    </InputAdornment>
  )
}
const InputFile = ({ files, converter, loading, requestState, inputRef }) => {
  const [data, setData] = files
  const fileInputRef = inputRef
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => {
    setAnchorEl((val) => {
      if (val) {
        return null
      }
      return event.currentTarget
    })
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const handleChange = (e) => {
    const InputFiles = Array.from(e.target.files)
    console.log(InputFiles[0])
    if (data.length > 0 && data.find(item => InputFiles.find(item2 => item2.lastModified === item.lastModified && item2.size === item.size && item2.name === item.name))) {
      return alert('File already exists')
    }
    const temp = [...InputFiles, ...data]
    if (temp.filter(item => !item.fileconverted).length > 5) {
      setData([...temp.filter(item => item.fileconverted), ...temp.filter(item => !item.fileconverted).slice(0, 5)])
      return alert('max 5 file at same time')
    }
    if (temp.some(item => getSizeNumber(item.size) >= 5)) {
      setData(temp.filter(item => getSizeNumber(item.size) < 5))
      return alert('file size must not be greater than 5MB')
    }
    inputRef.current.value = ''
    setData(temp)
  }
  const handleClear = () => {
    if (window.confirm('Are you sure to clear all files?')) {
      setData([])
      fileInputRef.current.value = ''
    }
  }
  const handleClearConverted = () => {
    if (window.confirm('Are you sure to clear all converted files?')) {
      setData(data.filter(item => !item.fileconverted))
      fileInputRef.current.value = ''
    }
  }
  const handleClearNoConverted = () => {
    if (window.confirm('Are you sure to clear all no converted files?')) {
      setData(data.filter(item => item.fileconverted))
      fileInputRef.current.value = ''
    }
  }
  const handleClearErrors = () => {
    if (window.confirm('Are you sure to clear all files with errors?')) {
      setData(data.filter(item => !item.error))
      fileInputRef.current.value = ''
    }
  }
  const handleConvert = () => {
    converter()
  }

  useEffect(() => {
    if (requestStateEnum.done === requestState) {
      if (('Notification' in window) && Notification.permission === 'granted') {
        const notification = new Notification('File convertion finished', {
          body: `Your files have been converted${data.every(item => item.downloable) ? '' : ', some file may have an error'}`,
          tag: 'convertion',
          timestamp: Date.now()
        })
        notification.addEventListener('click', () => {
          window.focus()
          notification.close()
        })
        setTimeout(() => {
          notification.close()
        }, 5000)
      }
    }
  }, [data, requestState])
  return (
    <Box width='100%'>
      <Stack mx='auto' my={1} width='fit-content' direction='row' gap={1} flexWrap='wrap' justifyContent='space-around'>
        <ButtonGroup variant='contained' color='error' disableElevation disabled={loading}>
          <Button startIcon={<Delete />} disabled={data.length === 0 || loading} color='error' onClick={handleClear}>
            Clear
          </Button>
          <Button
            aria-controls={open ? 'demo-positioned-menu' : undefined} color='error' aria-haspopup='true' aria-expanded={open ? 'true' : undefined}
            disabled={data.length === 0 || loading} onClick={handleClick} sx={{ px: 0 }}
          >
            <MoreVert />
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button'
              }}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left'
              }}
            >
              <MenuItem onClick={handleClearConverted} disabled={!data.some(item => item.fileconverted)}>
                <ListItemIcon>
                  <ChecklistRtl />
                </ListItemIcon>
                Clear converted
              </MenuItem>
              <MenuItem onClick={handleClearNoConverted} disabled={!data.some(item => !item.fileconverted)}>
                <ListItemIcon>
                  <Rule />
                </ListItemIcon>
                Clear no converted
              </MenuItem>
              <MenuItem onClick={handleClearErrors} disabled={!data.some(item => item.error)}>
                <ListItemIcon>
                  <ErrorOutline />
                </ListItemIcon>
                Clear with errors
              </MenuItem>
            </Menu>
          </Button>
        </ButtonGroup>
        <Box>
          <input type='file' accept='image/*' multiple hidden id='input-file' onChange={handleChange} ref={fileInputRef} />
          <Stack component='label' htmlFor='input-file'>
            <Button disableElevation startIcon={<Upload />} disabled={loading} variant='contained' sx={{ textWrap: 'nowrap', width: 'fit-content' }} component='span' role='button'>
              Load Files
            </Button>
          </Stack>
        </Box>
        <Button disableElevation startIcon={<Compare />} variant='contained' sx={{ width: 'fit-content', textWrap: 'nowrap' }} disabled={(data.filter(item => !item.fileconverted && !item.error)).length === 0 || loading} onClick={handleConvert}>
          Convert {(data.filter(item => !item.fileconverted)).length > 1 && 'all'}
        </Button>
      </Stack>
      <LinearProgress sx={{ width: '100%', visibility: `${loading ? 'visible' : 'hidden'}` }} />
    </Box>
  )
}
const FileList = ({ files, inputRef }) => {
  const theme = useTheme()
  const [data, setData] = files
  const handleClick = (index) => {
    setData(data.filter((_, i) => i !== index))
    inputRef.current.value = ''
  }
  return (
    <Box height='100%' flex='auto' width='100%' mt={2}>
      <Masonry columns={{ lg: 4, xs: 2 }} spacing={4} sx={{ maxWidth: 'xl', width: '100%', mx: 'auto', p: 1 }}>
        {data.map((file, index) => (
          <Box key={index} width='200px' border={1} p={2} boxSizing='content-box' borderRadius={2} borderColor={theme.palette.divider}>
            <Stack direction='row' alignItems='center' mb={1}>
              <InputFilename file={[file, setData]} index={index} placeholder={file.name || 'no filename'} />
            </Stack>
            <Box position='relative'>
              <img src={URL.createObjectURL(file.fileconverted || file)} alt={file.name} style={{ height: 'auto', width: '100%', objectFit: 'contain' }} />
              {((!file.downloable && !file.error)) && <Chip sx={{ m: 2, position: 'absolute', right: 0, top: 0, zIndex: 1, textTransform: 'uppercase' }} color='primary' size='small' variant='contained' label={file.type} />}
              {file.fileconverted && <Chip sx={{ m: 2, position: 'absolute', right: 0, top: 0, zIndex: 1, textTransform: 'uppercase' }} color='secondary' size='small' variant='contained' label='webp' />}
              {file.error && <Chip sx={{ m: 2, position: 'absolute', right: 0, top: 0, zIndex: 1, textTransform: 'uppercase' }} color='error' size='small' variant='contained' label='error' />}
            </Box>
            <Tooltip title={`${getSizeNumber(file.size) > 5 ? 'File exceeds 5Mb' : ''}`}>
              <Typography variant='caption' color={`${getSizeNumber(file.size) > 5 ? 'crimson' : 'inherit'}`} textAlign='center' display='block'>{getSize(file.size)}</Typography>
            </Tooltip>
            <Stack direction='row' justifyContent='flex-end' alignItems='center'>
              <IconButton disabled={!file.downloable} component='a' href={file.fileconverted && URL.createObjectURL(file.fileconverted)} download={file.newName?.replace(' ', '-') || true}>
                <Download />
              </IconButton>
              <IconButton onClick={() => handleClick(index)}>
                <Clear />
              </IconButton>
            </Stack>
            {file.error && <Typography variant='caption' color='crimson' textAlign='center' display='block'>{file.error}</Typography>}
          </Box>
        ))}
      </Masonry>
    </Box>
  )
}
InputFile.propTypes = {
  files: PropTypes.array.isRequired,
  converter: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  requestState: PropTypes.number,
  inputRef: PropTypes.object.isRequired
}
FileList.propTypes = {
  files: PropTypes.array.isRequired,
  inputRef: PropTypes.object.isRequired
}
InputFilename.propTypes = {
  file: PropTypes.array.isRequired,
  index: PropTypes.number.isRequired,
  placeholder: PropTypes.string
}
CloseCustomButton.propTypes = {
  setFilename: PropTypes.func.isRequired
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
const IconStatusApi = ({ status, ...props }) => {
  switch (status) {
    case 'up':
      return (
        <CloudDoneOutlined {...props} />
      )
    case 'down':
      return <CloudOffOutlined {...props} />
    default:
      return (
        <CloudSyncOutlined {...props} />
      )
  }
}

IconStatusApi.propTypes = {
  status: PropTypes.string.isRequired,
  fontSize: PropTypes.string
}
