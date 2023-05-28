import { useDispatch, useSelector } from "react-redux"
import { useState, useRef, useEffect } from "react";
import postImage from '../../helper_functions/postImage.js'
import Post from '../../components/Post.jsx';
import classes from './mainPage.module.css'
import {fetchMyPosts, createPost,} from '../../features/postSlice'
import { ReactComponent as Append } from '../../assets/icons/append.svg'
import { ReactComponent as Tags } from '../../assets/icons/tags.svg'

export default function PostBlock(props) {
    // let [post, setPost] = useState([...props.posts])
    let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    let tools = useRef(null)
    let tags = useRef(null)
    let append = useRef(null)
    let textArea = useRef(<textarea>nothing</textarea>)
    let [focus, setFocus] = useState(false)
    let [imagesToAppend, setImagesToAppend] = useState([])
    let [textLeng, setTextLeng] = useState(0)
    let dispatch = useDispatch()

    useEffect(_ => {
        textArea.current.style.height = 50 + (textLeng/4) + 'px'
    }, [textLeng])
    function appendImage(e) {
        postImage(e.target, undefined/*album*/, true/*post*/).then(res => {
            dispatch(props.savePicture({picture:res, myData:props.auth}))
            .then(resp => {
                console.log(resp);
                setImagesToAppend(prev => [...prev, resp.payload])
            })
        })
    }
    function filterTags(strTags) {
        let result = strTags.split(' ')
        for (let i = 0; i < result.length-1; i++) {//gets rib of repeating tags
            for (let j = i; j < result.length-1; j++) {
                if(result[i] === result[j+1]) result[i] = ''
            }    
        }
        return result.filter(str => str.length > 0)
    }
    function savePost(e) {
        let result = filterTags(tags.current.value)
        let imgs = imagesToAppend.map(img => img._id)
        imagesToAppend.forEach(img => img)//UPDATE IMAGE'S FIELD POST = TRUE
        dispatch(createPost({text: textArea.current.value, id:props.auth._id, tags:result, imageUrl: imgs, token:props.auth.token, update:props.setUpdate}))
        textArea.current.value = ''
        textArea.current.style.height = 50 + 'px'
        setImagesToAppend([])
    }
    function showTools() { tools.current.style.display = "flex"}
    function hideTools() {
        if(focus==false && imagesToAppend.length === 0)setTimeout(_ => tools.current.style.display = "none",200)
    }

    function addTags(e) {
        e.preventDefault()
        tags.current.style.display = 'flex'
    }
    return (
        <div>
            <div className={classes.makePost} onMouseLeave={hideTools} onMouseEnter={showTools}>
                <h2>Make post</h2>
                <textarea ref={textArea} placeholder='Text' onFocus={_ => setFocus(true)} onBlur={_ => setFocus(false)} onInput={e => setTextLeng(e.target.value.length)}></textarea>
                <div className={imagesToAppend.length !== 0? classes.imagesToAppend_show :  classes.imagesToAppend_hide}>
                    {imagesToAppend.map((image, id) => {
                        return <div key={id} className={classes.imgToAppendWrapper}>
                                   <div className={classes.background}></div>
                                   <div className={classes.imageWrapper}><img data-id={image._id} src={image.imageURL} className={classes.imageToAppend} onClick={e => {
                                       props.setSliderTrue(true)
                                       props.setcurrPictureId(e.target.dataset.id)
                                    }}/>
                                    </div>
                               </div>
                    })}
                </div>
                <div className={classes.tools} ref={tools}>
                   <button className={classes.publish} onClick={savePost}>Publish</button>
                   <input className={classes.append} id="image-append" ref={append} type="file" onInput={e => appendImage(e)}></input>
                   <Append className={classes.appendIcon}/>
                   <a href='' className={classes.tag}> <Tags className={classes.tagsIcon} onClick={addTags}/></a>
                   <div>
                      <input ref={tags} className={classes.tagsInput} onFocus={_ => setFocus(true)} onBlur={_ => setFocus(false)} placeholder='firstTag secondTag...'/>
                   </div>
                </div>
            </div>
            <div className={classes.postsList}>{
                props.posts.map((post,id) => {
                    let year = post.createdAt.slice(0,4)
                    let month = post.createdAt.slice(5,7)
                    month = month[0] === '0'?  +month[1] - 1 : +month - 1
                    let day = post.createdAt.slice(8,10)
                    let time = post.createdAt.slice(11,16)
                    return <Post key={id} date={months[month] + ' ' + day} images={post.images==undefined?[]:post.images} time={time} year={year} text={post.text}/>
                })
            }
            </div>
        </div>
    )
}