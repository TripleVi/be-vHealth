import express from 'express';
import bodyParser from 'body-parser';
import userRouter from "./routes/user_router.js";
import postRouter from "./routes/post_router.js";
import commentRouter from "./routes/comment_router.js";
import friendRouter from "./routes/friend_router.js";
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import StorageService from './services/storage_service.js';

const app = express()
app.use(bodyParser.json())
app.use('/api/v1/users', userRouter)
app.use('/api/v1/posts', postRouter)
app.use('/api/v1/comments', commentRouter)
app.use('/api/v1/friends', friendRouter)

const firebaseConfig = {
  apiKey: 'AIzaSyDDKrZ2yYb6Bujlnk7oIs_BlLXd7z11JYI',
  authDomain: 'v-health-c5b6e.firebaseapp.com',
  projectId: 'v-health-c5b6e',
  storageBucket: 'v-health-c5b6e.appspot.com',
  messagingSenderId: '231780000645',
  appId: '1:231780000645:web:52363262ea9b3e4d0cdaec',
}

const fbApp = initializeApp(firebaseConfig)
const storage = getStorage(fbApp)
StorageService.init(storage)

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server is running at port ${port}`)    
})