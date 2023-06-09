import classes from './gallery.module.css'

import {useState, useEffect, useRef} from 'react'
import { ReactComponent as AddPhoto } from '../../assets/icons/addPhoto.svg'
import { ReactComponent as Plus } from '../../assets/icons/plus.svg'
import { useSelector, useDispatch} from 'react-redux'
import Slider from '../../components/Slider.jsx'
import {fetchMyAlbums, savePicture} from '../../features/albumSlice'
import CreateModal from '../../components/Create_modal'
import postImage  from '../../helper_functions/postImage'
import Loader from '../../components/Loader'

export default function Gallery(props) {
    let myData = useSelector(state => state.auth.data)
    let albums = useSelector(state => state.albums.albums)
    let dispatch = useDispatch()
    let addPicture = useRef(null), 
    underlines = useRef([<input value={'text'}/>])
    let [sliderTrue, setSliderTrue] = useState(false)
    let [closeModal, setModal] = useState(true)
    let [currentPictures, setPictures] = useState([])
    let [isLoaded, finishLoading] = useState(false)
    let [currentAlbum, setAlbum] = useState('All')
    let [currPictureId, setcurrPictureId] = useState(null)
    let [updatePictures, setUpdate] = useState(false)
    useEffect(()=> { 
        dispatch(fetchMyAlbums({userid: myData._id, token: myData.token, update: setUpdate}))
        finishLoading(true)
        setPictures(albums)
    },[updatePictures])
    
    function showAlbum(e) {
        setAlbum(e.target.innerText)
        if(e.target.parentNode.childNodes[0].innerText !== currentAlbum) {
            console.log(currentAlbum);
            [...e.target.parentNode.parentNode.childNodes].map(album => {
                if(album.id !== 'albums') return
                if(album.childNodes[0].innerText === currentAlbum) {
                   album.childNodes[0].style.backgroundColor = 'rgba(228, 232, 243, 0.822);' 
                   album.childNodes[0].style.paddingLeft = 20 + 'px'
                   album.childNodes[0].style.fontSize = 16 + 'px'
                } else{
                    e.target.parentNode.childNodes[0].style.backgroundColor = 'rgba(228, 232, 243, 0.822);' 
                    e.target.parentNode.childNodes[0].style.paddingLeft = 25 + 'px'
                    e.target.parentNode.childNodes[0].style.fontSize = 18 + 'px'
                }
            })
        } 
    }
    function showSlider(e) {
        setSliderTrue(!sliderTrue)
        setcurrPictureId(e.target.dataset.id)
    }
    function doAnimation(e) {e.target.childNodes.forEach(child => {
        underlines.current.forEach(item => item.id === child.id?  item.style.width = 200 + 'px' : null)
    })}
    function removeAnimation(e) {underlines.current.forEach(underline => underline.style.width = 100 + 'px')}
    function uploadPicture(e) {
        postImage(e.target, currentAlbum, false/*post*/ ).then(res => {
            dispatch(savePicture({picture:res, myData, setUpdate})).then(_ => {//save in db
                setUpdate(true)
                setPictures(currentPictures)
            })
        })
    }

    if(isLoaded === false) return <Loader/>
    return (
        <div className={classes.background}>
        <div className={classes.gallery}>
            <div className={classes.rightPanel}>
               <div className={classes.albums}>
               <h1>Albums</h1>
               {currentPictures.map((album, id) => {
                return (
                    <div id="albums" key={id} onClick={showAlbum} className={classes.album} onMouseEnter={doAnimation} onMouseMove={doAnimation} onMouseLeave={removeAnimation}>
                    <p>{album.name}</p>
                    <div ref={el => underlines.current[id] = el}  id={id} className={classes.underline}><p></p></div>
                    </div>
                )
               })}
               <Plus className={classes.addAlbum} onClick={() => setModal(prev => prev = !closeModal)}/>
               </div>
            </div>
            <div className={classes.galleryBody}>
                    {
                    currentPictures.map((album, id) => {
                         if(album.name === currentAlbum) {
                            return album.images.map((photo, id) => {
                                console.log(photo);
                                return <div  key={id} className={classes.imgWrapper} onClick={e => showSlider(e)}><img data-id={photo._id} date={photo.date} title={photo.title} className={classes.img} src={photo.imageURL} desc={photo.description}></img></div>
                            }) 
                         }
                    })
                    }
                                   <div className={classes.addPicture}>
                  <label htmlFor="file-upload" className={classes.customUpload}><Plus className={classes.addPhoto}/></label>
                  <input className={classes.inputHide} id="file-upload" ref={addPicture} type="file" onInput={uploadPicture}/>
               </div>
            </div>
            <CreateModal closeModal={closeModal} setModal={setModal} userId={myData._id} update={setUpdate} token={myData.token}/>
            <Slider setUpdate={setUpdate} token={myData.token} currentPictures={currentPictures} sliderTrue={sliderTrue} setSliderTrue={setSliderTrue} currPictureId={currPictureId}></Slider>
        </div>
        </div>
    )
}


