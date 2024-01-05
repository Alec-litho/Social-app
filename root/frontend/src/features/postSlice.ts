import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios, { AxiosError, AxiosRequestConfig } from 'axios'

interface InitialState {
  userToken: string
  posts: IPost[]
  myPosts: IPost[]
  status: string
  error: string | null
}
const initialState:InitialState = {
  userToken: "",
  posts: [],
  myPosts: [],
  status: 'idle',
  error: null
}


export const uploadComment = createAsyncThunk('posts/postComment', async function({comment,token}:{comment:CreateCommentDto,token:string}):Promise<IComment> {
  try{
    const response = await axios.post(`http://localhost:3001/comment/`,JSON.stringify(comment), {headers: {
      'Content-Type': 'application/json',
       Authorization: `Bearer ${token}`
    }})
    return response.data
  } catch(err:any) {
    console.log(err);
    return err
  }
  
})

export const uploadReply = createAsyncThunk('posts/postReply', async function({comment,id,token}:{comment:CreateCommentDto,id:string,token:string}):Promise<IComment> {
  try {
    if(!initialState.userToken) throw new Error("Token is not defined")
    const response = await axios.post(`http://localhost:3001/comment/${id}`,JSON.stringify(comment),{headers: {
      'Content-Type': 'application/json',
       Authorization: `Bearer ${token}`
    }})
    return response.data
  } catch (err:any) {
    return err
  }
})

export const fetchMyPosts = createAsyncThunk('posts/fetchMyPosts', async ({_id, postLength, token}:{_id:string,postLength:number,token:string},{rejectWithValue}):Promise<{posts:IPost[] | [], postLength: number}> => {
    const response = await axios.get(`http://localhost:3001/post/user/${_id}`,{headers: {
      'Content-Type': 'application/json',
       Authorization: `Bearer ${token}`
    }})
    console.log(_id,response);
    return {posts:[...response.data].reverse(), postLength};
})

export const createPost = createAsyncThunk('posts/createPost', async ({post, token}:{post:CreatePostDto,token:string},{rejectWithValue}) => {
  try {
    console.log(post);
    
    const {data}:{data:IPost} = await axios.post('http://localhost:3001/post',JSON.stringify(post),{headers: {
      'Content-Type': 'application/json',
       Authorization: `Bearer ${token}`
    }});
    return data;
  } catch (err:any) {
    let error: AxiosError<PaymentValidationErrors> = err
    if (!error.response) throw err
    return rejectWithValue(error.response.data)
  }
})

export const deletePost = createAsyncThunk('posts/deletePost', async({id,token}:{id:string,token:string}, {rejectWithValue}) => {
  try {
    let response = await axios.delete(`http://localhost:3001/post/${id}`,{headers: {
      'Content-Type': 'application/json',
       Authorization: `Bearer ${token}`
    }});
    return response.data;
  }catch (err:any) {
    let error: AxiosError<PaymentValidationErrors> = err
    if (!error.response) throw err
    return rejectWithValue(error.response.data)
  }
  
})
export const watched = createAsyncThunk('posts/watched', async function({id,token}:{id:string,token:string}):Promise<boolean> {
  try {
    const response = await axios.get(`http://localhost:3001/post/watched/${id}`,{headers: {
      'Content-Type': 'application/json',
       Authorization: `Bearer ${token}`
    }});
    return response.data;
  } catch (err:any) {
    return err
  }

})

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    getInitialState: (state:InitialState, action) => {
      state.userToken = action.payload.token
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyPosts.fulfilled, (state, action) => {
        console.log('w');
        state.status = 'fulfilled'
        let posts = [...action.payload.posts]
        let postLength = action.payload.postLength 
        let slicedPosts = posts.slice(postLength, postLength+10)
        console.log(posts);
        state.myPosts = [...state.myPosts, ...slicedPosts]
      })
      .addCase(fetchMyPosts.rejected, (state, action:any) => {
        state.status = 'error'
        state.error = action.payload
      })
      .addCase(uploadComment.fulfilled, (state,action) => {
        state.myPosts = [...state.myPosts].map((post):IPost => {//iterate through myPosts array to find post whose id matches the id of the post that was commented
          if(post._id === action.payload.post) {
            post.comments = [...post.comments, action.payload]//add new comment
            return post;
          }
          else return post
        })
      })
      .addCase(uploadComment.rejected, (state,action:any) => {
        state.status = 'error'
        state.error = action.payload
      } )
      .addCase(createPost.fulfilled, (state, action) => {
        state.status = 'fulfilled';
        state.error = null;
        let reversedArr = [...state.myPosts].reverse();
        state.myPosts = [...reversedArr, action.payload].reverse();
      })
      .addCase(createPost.rejected, (state, action:any) => {
        state.status = 'error'
        state.error = action.payload
      })
      .addCase(deletePost.fulfilled, (state,action) => {
        console.log(action.payload);
        state.status = 'fulfilled';
        state.error = null;
        state.myPosts = [...state.myPosts].filter(post => post._id !== action.payload._id);
      })
      .addCase(deletePost.rejected, (state,action:any) => {
        state.status = 'error'
        state.error = action.payload
      })
  }
})

export default postSlice.reducer