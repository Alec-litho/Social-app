import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axios, { AxiosResponse } from "axios"



interface InitState {
    archivedNotificationMessages: NotificationMessage[]
    newNotificationMessages: NotificationMessage[]
    status: string,
    error: null
}

const initialState:InitState = {
    archivedNotificationMessages: [],
    newNotificationMessages: [],
    status: 'undefined',
    error: null
}
export const getNotificationMessages = createAsyncThunk("notifications/getNotificationMessages", async({userId,messagesNum}:{userId:string,messagesNum:number}) => {
    const response:AxiosResponse<NotificationMessage[]> = await axios.get(`http://localhost:3001/notifications/get/${userId}/${messagesNum}`);
    return response.data
})
export const updateViewedMessages = createAsyncThunk("notifications/updateViewedMessages", async(userId:string) => {
    await axios.get(`http://localhost:3001/notifications/updateViewedMessage/${userId}`);
})

const notificationsSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        setNewNotificationMessages: (state, action) => {
            state.newNotificationMessages.push(...action.payload)
        }
    },
    extraReducers: (builder) => {
        builder.addCase(updateViewedMessages.fulfilled, (state,action) => {
            const viewedMessages = [...state.newNotificationMessages].map((msg) => {return {...msg, viewed:"true"}})
            state.archivedNotificationMessages = [...state.archivedNotificationMessages, ...viewedMessages]
            state.newNotificationMessages = []
        }),
        builder.addCase(getNotificationMessages.fulfilled, (state,action) => {
            console.log(action, action.payload)
            state.archivedNotificationMessages = action.payload.filter(message=>message.viewed.toString()==='true')
            state.newNotificationMessages = action.payload.filter(message=>message.viewed.toString()==='false')
        })
    }
})

export const notificationsReducer = notificationsSlice.reducer
export const {setNewNotificationMessages} = notificationsSlice.actions