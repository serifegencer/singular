
import { Avatar,Button } from "@mui/material";
import  {Post} from "../../components/post/Post";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import GridOnOutlinedIcon from "@mui/icons-material/GridOnOutlined";
import VideoLibraryOutlinedIcon from "@mui/icons-material/VideoLibraryOutlined";
import BookmarkAddOutlinedIcon from "@mui/icons-material/BookmarkAddOutlined";
import AccountBoxOutlinedIcon from "@mui/icons-material/AccountBoxOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { AuthContext } from "../../context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { useParams,  useNavigate } from "react-router-dom";
import axios from "axios";
import "./profile.css"

export const Profile = () => {
  const [user, setUser] = useState([]);
  const { user: currentUser, dispatch } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [followed, setFollowed] = useState();
  const username = useParams().username; 
  
  const PF = process.env.REACT_APP_PUBLIC_FOLDER
  const navigate = useNavigate();

   useEffect(() => {
      const getUser = async () => { 
      const res = await axios.get("/users?username=" + username);
      setUser(res.data);
    };
     getUser();
     setFollowed(currentUser.followings.includes(user?._id));
    }, [username, currentUser.followings, user?._id ]);

    useEffect(() => {
      const getPosts = async () => { 
      const res = await axios.get("/posts/profile/" + username);
      setPosts(res.data);
    };
     getPosts();
    }, [username]);

    const handleClick = async () => {
      try {
        if(followed){
          await axios.put("/users/" + user._id + "/unfollow", {
            userId: currentUser._id,
          });
          dispatch({ type: "UNFOLLOW", payload: user._id})
        }else{
          await axios.put("/users/" + user._id + "/follow", {
            userId: currentUser._id,
          });
          dispatch({ type: "FOLLOW", payload: user._id})
        }
        setFollowed(!followed);
      } catch (err) {
        console.log(err);
      }
     
    };
    const handleOutClick = async () => {
      if(window.confirm( "Are you sure want to logout?")){
        dispatch({ type: "LOGOUT"});
      };
    };

    const createConversation = async () => {
     try {
      await axios.post("/conversations", {
        senderId: currentUser._id,
        receiverId: user._id,
      });
      navigate("/messenger");
     } catch (err) {
       console.log(err);
     }

    };
     

  return (
    <div className="container">
       <div className="profile-page">
        <div className="profile-head">
           <div className="head-left">
            <a href="/">
            <Avatar src={user.profilePicture && PF + user.profilePicture } 
            sx={{ width: 150, height: 150 }}
            />
            </a>
          </div>
            <div className="head-right">
              <div className="head-right-top">
                <span className="profile-username">{user.username}</span>
                <div className="profile-page-buttons">
                    {user._id !== currentUser._id ? (
                      <Button 
                      variant="contained" 
                      size="small"
                      color={followed ? "error" : "success"}
                      onClick={handleClick}
                       >
                        {followed ?  "Takipten çıkar" : "Takip Et"}
                        </Button>
                     ) : (
                    <Button variant="contained" size="small">DÜZENLE</Button>
                     )}
                      {user._id === currentUser._id ? (
                      <button>
                      <SettingsOutlinedIcon/>
                      </button>
                      ) : ( <button onClick={createConversation}>
                        <MailOutlineIcon/>
                      </button>
                      )}
                      {user._id === currentUser._id && (
                      <button onClick={handleOutClick}>
                        <LogoutOutlinedIcon color="error"/>
                      </button>
                      )}
                </div>
                </div>  
              <div className="head-right-center">
                <div className="post-count">
                    <b>{posts.length}</b>
                    <span>posts</span>
                </div>
                <div className="follower-count">
                    <b>{user.followers && user.followers.length}</b>
                    <span>follower</span>
                </div>
                
                <div className="following-count">
                    <b>{user.followings && user.followings.length}</b>
                    <span>following</span>
                </div>
                </div>  
              <div className="head-right-bottom">
                 <b>{user.fullName}</b>
                 <span>
                    {user.bio && user.bio}
                 </span>
                </div>  

            </div>
            </div>  
            <div className="profile-body">
                <div className="profile-nav-tabs">
                    
                    <button className="active">
                        <GridOnOutlinedIcon/>
                        <span>POSTS</span>
                    </button>
                    <button>
                        <VideoLibraryOutlinedIcon/>
                        <span>VIDEO</span>
                    </button>
                    <button>
                        <BookmarkAddOutlinedIcon/>
                        <span>VIDEOS</span>
                    </button>
                    <button>
                        <AccountBoxOutlinedIcon/>
                        <span>TAGGED</span>
                    </button>
                </div>
                <div className="profile-post-grid">
                   {posts.map ((post) =>(
                    <div className="grid-post" key={post._id}>
                        <Post post={post} />
                        
                    <div className="like-icon-wrapper">
                       <FavoriteIcon className="like-icon"/> 
                         <b>{post.likes && post.likes.length}</b>
                    </div>
                    </div>
                    ))} 
                </div>
          </div>      
      </div> 
    </div>
  );
};
