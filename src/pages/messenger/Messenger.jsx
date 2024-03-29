
import {ChatOnline} from "../../components/chatOnline/ChatOnline";
import { Message } from "../../components/message/Message";
import { Conversation } from "../../components/conversation/Conversation";
import { Button } from "@mui/material";
import { io }  from "socket.io-client";
import axios from "axios";
import { useRef, useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./messenger.css";

export const Messenger = () => {
  
    const socket = useRef(io("ws://localhost:8900/"));
    const [conversations, setConversations] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [arrivalMessage, setArrivalMessage] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
  
    const scrollRef = useRef();
    const { user } = useContext(AuthContext);
    
    useEffect(() => {
       socket.current = io("ws://localhost:8900/");  
       socket.current.on("getMessage", (data) => {
        setArrivalMessage({
          sender: data.senderId,
          text: data.text,  
          createdAt: Date.now(),
        });
       }); 
    }, []);
    
    useEffect(() => {
       arrivalMessage && 
       currentChat?.members.includes(arrivalMessage.sender) && 
       setMessages((prev) => [...prev, arrivalMessage]);
    
    }, [arrivalMessage, currentChat]);
      
    
    useEffect(() => {
      const getConversations = async () => {
        try {
          const res = await axios.get("/conversations/" + user._id);  
          setConversations(res.data);
        } catch (err) {
            console.log(err);
        }
      };   
      getConversations();
    }, [user._id]);
    
    useEffect(() => {
      socket.current.emit("addUser", user._id);
      socket.current.on("getUsers", (users) => {
      setOnlineUsers(user.followings.filter((f) => users.some((u) => u.userId === f)));
      });
    }, [user]);
    

    useEffect(() => {
        const getMessages = async () => {
            try {
               const res = await axios.get("/message/" + currentChat?._id); 
               setMessages(res.data);
            } catch (err) {
               console.log(err); 
            }
        };
        getMessages();
    }, [currentChat]);



    const handleSubmit = async (e) => {
        e.preventDefault();
        const message = {
            sender: user._id,
            text: newMessage,
            conversationId: currentChat?._id,
        };
        const receiverId = currentChat.members.find(
            (member) => member !== user._id
        );
        socket.current.emit("sendMessage", {
            senderId: user._id,
            receiverId,
            text: newMessage,
        });

        try {
          const res = await axios.post("/message", message);
          setMessages([...messages, res.data]);  
          setNewMessage("");
        } catch (err) {
          console.log(err);
        }
    };

    useEffect(() => {
     scrollRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);
    

    return (
    <div className="messenger">
        <div className="chat-menu">
            <div className="chat-menu-wrapper">
                <input 
                type="text" 
                className="chat-menu-input" 
                placeholder="Search for Friend"
                />
                {conversations.map((c) => (
                 <div  onClick={() => setCurrentChat(c)} key={c._id} > 
                    <Conversation 
                    conversation={c} 
                    currentUser={user}
                    />
                 </div>
                ))} 
            </div>
        </div>
        
        <form className="chat-box" onSubmit={handleSubmit}>
            <div className="chat-box-wrapper">
            {currentChat ? (
                <>
                <div className="chat-box-top">
                   {messages.map((m, index) =>( 
                    <div ref={scrollRef} key={index}>
                        <Message message={m} 
                        own={m.sender === user._id}
                        user={user}
                        currentChat={currentChat}/>
                    </div>
                   ))}
                </div>
                <div className="chat-box-bottom">
                    <textarea 
                    className="chat-message-input" 
                    placeholder="Write something..."
                    onChange={(e) => setNewMessage(e.target.value)}
                    value={newMessage}
                    ></textarea>
                    <Button color="success"
                    variant="contained"
                    className="chat-submit-button"
                    type="submit"
                    onClick={handleSubmit}
                    >
                       Send
                    </Button>
                </div>
                </>
                ) : (
                  <h1>Start a Chat.</h1>
                )}
            </div>          
        </form> 
        <div className="chat-online">
        
            <div className="chat-online-wrapper">
             <h4>Online Users</h4>
                <ChatOnline 
                onlineUsers={onlineUsers}
                 currentId={user._id}
                 setCurrentChat={setCurrentChat}
                 />
                
            </div>
        </div>

    </div>
  )
}

