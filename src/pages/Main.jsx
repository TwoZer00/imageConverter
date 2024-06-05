import { PropTypes } from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import { Box, Stack, Button, CssBaseline, ThemeProvider, createTheme, Typography, IconButton, useTheme, alpha, LinearProgress, Chip, TextField, InputAdornment, Tooltip, Menu, MenuItem, ListItemIcon, ButtonGroup, Snackbar, Slide, Alert } from '@mui/material'
import Masonry from '@mui/lab/Masonry'
import { ChecklistRtl, Clear, Close, CloudDoneOutlined, CloudOffOutlined, CloudSyncOutlined, Compare, Delete, Download, MoreVert, Rule, Upload } from '@mui/icons-material'
const API_URL_BASE = 'https://image-converter-k56z.onrender.com'
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
  const [files, setFiles] = useState([])
  const [requestState, setRequestState] = useState(requestStateEnum.none)
  const convert = () => {
    setRequestState(requestStateEnum.loading)
    const temp = [...files]
    const promises = []
    for (const item of temp) {
      if (item.fileconverted) {
        continue
      }
      const promise = new Promise((resolve, reject) => {
        const formData = new FormData()
        formData.append('image', item)
        fetch(API_URL, { method: 'POST', body: formData }).then(async (res) => {
          if (res.status !== 200) {
            reject(new Error((await res.json()).message))
          }
          sessionStorage.setItem('convertion', Date.now())
          return res.blob()
        }).then((blob) => {
          item.fileconverted = blob // save blob to item
          item.downloable = true
          resolve(item)
        }).catch((error) => {
          reject(error)
        })
      })
      promises.push(promise)
    }
    // check if petition is taking more than 30 secs
    const timeOut = setTimeout(() => {
      setRequestState(requestStateEnum.stillLoading)
    }, 30000)
    Promise.allSettled(promises).then((values) => {
      setFiles((val) => {
        const temp = [...val]
        for (const item of values) {
          if (item.status === 'fulfilled') {
            temp[temp.findIndex((i) => i.name === item.value.name)] = item.value
          }
        }
        return temp
      })
    }).catch((error) => {
      console.error(error)
      setRequestState(requestStateEnum.error)
    }).finally(() => {
      clearTimeout(timeOut)
      setRequestState(requestStateEnum.done)
      setTimeout(() => {
        setRequestState(requestStateEnum.none)
      }, 3000)
    })
  }
  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Stack maxWidth='100dvw' height='100dvh'>
          <Stack component='header' direction='column' alignItems='center' mt={1}>
            <Typography variant='h1' fontSize={32} fontWeight={400} textTransform='uppercase'>Image converter</Typography>
            <Typography variant='subtitle1' fontSize={12}>Convert images(png, jpeg, jpg) to webp</Typography>
          </Stack>
          <Box component='main'>
            <Box sx={{ position: 'sticky', backgroundColor: `${alpha(theme.palette.background.default, 0.25)}`, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, left: 0, top: 0, flexDirection: 'column', backdropFilter: 'blur(5px)', border: 1, borderColor: theme.palette.divider, borderLeft: 0, borderRight: 0, borderTop: 0 }}>
              <InputFile files={[files, setFiles]} converter={convert} loading={requestState === requestStateEnum.loading} requestState={requestState} />
            </Box>
            <FileList files={[files, setFiles]} />
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
        sx={{ '& .MuiInput-root:hover:not(.Mui-disabled, .Mui-error):before': { border: 'none' }, '& .MuiInput-root:before': { border: 'none' } }}
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
const InputFile = ({ files, converter, loading, requestState }) => {
  const [data, setData] = files
  const fileInputRef = useRef(null)
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
  const handleClearConverted = () => {
    if (window.confirm('Are you sure to clear all converted files?')) {
      setData(data.filter(item => !item.fileconverted))
    }
  }
  const handleClearNoConverted = () => {
    if (window.confirm('Are you sure to clear all no converted files?')) {
      setData(data.filter(item => item.fileconverted))
    }
  }

  useEffect(() => {
    if (requestStateEnum.done === requestState) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          const notification = new Notification('All files converted', {
            body: 'All files converted',
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
      })
    }
  }, [requestState])
  return (
    <Box width='100%'>
      <Stack mx='auto' my={1} width='fit-content' direction='row' gap={1} flexWrap='wrap' justifyContent='space-around'>
        <ButtonGroup variant='contained' color='error' disableElevation>
          <Button startIcon={<Delete />} disabled={data.length === 0} color='error' onClick={handleClear}>
            Clear
          </Button>
          <Button
            aria-controls={open ? 'demo-positioned-menu' : undefined} color='error' aria-haspopup='true' aria-expanded={open ? 'true' : undefined}
            disabled={data.length === 0} onClick={handleClick} sx={{ px: 0 }}
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
            </Menu>
          </Button>
        </ButtonGroup>
        <Box>
          <input accept='image/png,image/jpg,image/jpeg' type='file' multiple hidden id='input-file' onChange={handleChange} ref={fileInputRef} />
          <Stack component='label' htmlFor='input-file'>
            <Button disableElevation startIcon={<Upload />} variant='contained' sx={{ textWrap: 'nowrap', width: 'fit-content' }} component='span' role='button'>
              Load Files
            </Button>
          </Stack>
        </Box>
        <Button disableElevation startIcon={<Compare />} variant='contained' sx={{ width: 'fit-content', textWrap: 'nowrap' }} disabled={(data.filter(item => !item.fileconverted)).length === 0 || loading} onClick={() => { converter() }}>
          Convert {(data.filter(item => !item.fileconverted)).length > 1 && 'all'}
        </Button>
      </Stack>
      <LinearProgress sx={{ width: '100%', visibility: `${(requestState === requestStateEnum.loading || requestState === requestStateEnum.stillLoading) ? 'visible' : 'hidden'}` }} />
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
              {file.fileconverted && <Chip sx={{ m: 2, position: 'absolute', right: 0, top: 0, zIndex: 1, textTransform: 'uppercase' }} color='secondary' size='small' variant='contained' label='webp' />}
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
  loading: PropTypes.bool,
  requestState: PropTypes.number
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
