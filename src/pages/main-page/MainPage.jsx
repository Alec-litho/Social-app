import {useState, useEffect} from 'react'
import {useDispatch, useSelector } from 'react-redux';
import {Link} from 'react-router-dom';
import Gallery from '../gallery-page/Gallery.jsx'
import Dialog from '../dialog-page/DialogPage.jsx'
import {fetchData} from '../../features/userSlice'
import {fetchMyAlbums, savePicture} from '../../features/albumSlice'
import {selectIsAuth} from '../../features/authSlice.js'
import Slider from '../../components/Slider.jsx';
import classes from './mainPage.module.css'
import PostBlock from './PostBlock.jsx'

export default function Main() {
    let [isLoaded, setFinish] = useState(false)
    let [photos, setPhotos] = useState([])
    let dispatch = useDispatch()
    let auth = useSelector(state => state.auth.data)
    let isAuth = useSelector(selectIsAuth)
    let userData = useSelector(state => state.main)
    let albums = useSelector(state => state.albums.albums)
    let [sliderTrue, setSliderTrue] = useState(false)
    let [currPictureId, setcurrPictureId] = useState(null)
    let [update, setUpdate] = useState(false)
    console.log(update);

    useEffect(() => {
        (function loadPhotos() {
            dispatch(fetchData(auth.token))
            dispatch(fetchMyAlbums({userid: auth._id, token: auth.token, update:setUpdate}))
            setFinish(true)
            setPhotos(albums)
        })()
    },[])
    return (
        <div className={classes.mainpage}>
            <Profile fullName={userData.userInfo.name} age={userData.userInfo.age} friends={userData.userInfo.friends} profilePicture={userData.userInfo.profilePicture} location={userData.userInfo.location}/>
            <div className={classes.mainContent}>
                <AboutMeBlock galleryPhotos={photos} setSliderTrue={setSliderTrue} isloadedState={isLoaded}/>
                <PostBlock  setcurrPictureId={setcurrPictureId} setSliderTrue={setSliderTrue} update={update} setUpdate={setUpdate} auth={auth} savePicture={savePicture}/>
            </div>
            <Sidebar/>
            <Slider sliderTrue={sliderTrue} setSliderTrue={setSliderTrue} currPictureId={currPictureId}></Slider>
        </div>
    )
}
function Sidebar() {
    return (
        <div className={classes.sidebar}>
          
        </div>
    )
}
function Profile(props) {
    // let profPicture = props.profilePicture? props.profilePicture : null
    return (
        <div className={classes.profileContainer}>
            <img src={props.profilePicture} className={classes.pofilePicture}></img>
            <div className={classes.infoBlock}>
            <h1>{props.fullName}</h1>
            <div className={classes.defaultInfo}>
                <div className={classes.leftInfoBlock}>
                    <p>Location:</p>
                    <p>Friends:</p>
                    <p>Age:</p>
                </div>
                <div className={classes.rightInfoBlock}>
                    <a href="#">{props.location}</a>
                    <a href="#">{props.friends}</a>
                    <a href="#">{props.age}</a>
                </div>
            </div>
            <button className={classes.book}> <Link to="/dialogs" element={<Dialog/>}>Message</Link></button>
            <button className={classes.subscribe}>Subscribe</button>
           </div>
        </div>
    )
}
function AboutMeBlock(props) {
    if(!props.isloadedState) return null
    return (
        <div className={classes.aboutMeBlock}>
            <div className={classes.aboutMeHeader}>
                <span>20 views</span>
                <Link to="/gallery" element={<Gallery/>}>See all</Link>
            </div>
            <div className={classes.gallery}>
                {props.galleryPhotos.map(album => {
                    if(album.name === 'All') {
                        return album.images.slice(0,8).map((photoObj, id) => {
                           return (<div className={classes.photoGallery} onClick={_ => props.setSliderTrue(true)} key={id}><img src={photoObj.imageURL}></img></div>)
                        })
                    }
                })}
            </div>
        </div>
    )
}


