import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import bodyParser from 'body-parser';
const app=express()

const allowedOrigins = [
    'https://front-end-video-hkmibtyso-aryans-projects-bbec6789.vercel.app',
    'https://front-end-video.vercel.app',
    'http://localhost:5179', 
    'https://frontend-videoapp.netlify.app'
  ];
  
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    })
  );
  

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({limit:"32kb"}))
app.use(express.static("public"))         
app.use(cookieParser())  
app.use(bodyParser.json()); // For parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); 
                     
export {app}

  
//imports

import userRouter from "./routes/User.routes.js"
import subscriptionRouter from "./routes/Subscription.routes.js"
import videoRouter from "./routes/Video.routes.js"
import likeRouter from "./routes/Like.route.js"
import playlistRouter from "./routes/Playlist.route.js"
import commentsRouter from "./routes/Comment.routes.js"
app.use("/api/v1/users", userRouter)
app.use("/api/v1/users", subscriptionRouter)     
app.use("/api/v1/videos", videoRouter) 
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/comment",commentsRouter)