import React from 'react';
import Message from './components/message/message';
import AuthService from '../../services/auth';

import './chat.scss';
import Button from '../button/button';
import Icon from '../icon/icon';

function Chat({exercixeId, user}) {
    const [content, setContent] = React.useState("");
    const [messages, setMessages] = React.useState([]);
    const [users, setUsers] = React.useState([]);
    const [reply, setReply] = React.useState(false);
    const [replyTo, setReplyTo] = React.useState(null);
    const [replies, setReplies] = React.useState([]);

    React.useEffect(()=>{
        AuthService.getDatabase().ref("users").on("value", snapshot => {
            let users = [];
            snapshot.forEach((snap) => {
              users.push(snap.val());
            });
            setUsers(users);
          });
        AuthService.getDatabase().ref("chats").orderByChild("exercise").equalTo(exercixeId).on("value", snapshot => {
            let chats = [];
            let replies = [];
            snapshot.forEach((snap) => {
                if(snap.val().replyTo){
                    replies.push(snap.val());
                } else {
                    chats.push(snap.val());
                }
            });
            setMessages(chats);
            setReplies(replies);
          });
    }, []);

    const handleSubmit = (event)=>{
        event.preventDefault();
        if(content){
            const m = {
                content: content, 
                timestamp: Date.now(), 
                uid: user.uid,
                exercise: exercixeId
            };
            if(reply){
                m.replyTo = replyTo.timestamp;
            }
            AuthService.getDatabase().ref('chats').push(m).then(()=>{
                setContent("");
                setReply(false);
                setReplyTo(null);
            });
        }
    }

    const handleChange = (event)=>{
        setContent(event.target.value);
    }

    const getUser = (uid)=>{
        return users.find(user=>user.uid === uid);
    }

    const handleReply = (message)=> {
        setReply(true);
        setReplyTo(message);
    }
    const getReplies = (timestamp) => {
        return replies.filter(reply => reply.replyTo === timestamp);
    }

    const closeReply = ()=>{
        setReply(false);
        setReplyTo(null);
    }

    return(
        <div className="chat">
            <div className="messageBox">
                {
                    messages.length === 0 ? <p> Endnu ingen kommentarer</p> : null
                }
                
                {
                    messages.map((message, i)=>
                    <div key={i}className="messageWrapper">
                            <Message 
                                message={message} 
                                user={getUser(message.uid)}
                                callback={handleReply}
                                />

                                {
                                    getReplies(message.timestamp).map((reply, j) => 
                                            <Message
                                                message={reply}
                                                user={getUser(reply.uid)}
                                                indent={true}
                                                key={j}
                                            />
    
                                    )
                                }
                                { replyTo && replyTo.timestamp === message.timestamp ?
                                <>
                                    <form onSubmit={handleSubmit}>
                                        <textarea type="text" onChange={handleChange} value={content}></textarea>
                                        <Button type="submit" value="Send"/>
                                    </form>
                                    <Icon icon="closeBlack" onClick={()=>closeReply()}></Icon>
                                </> : null
                                }
                                
                    </div>
                    )
                    
                }
            </div>
            <form onSubmit={handleSubmit}>
                <textarea disabled={reply} type="text" onChange={handleChange} value={content}></textarea>
                <Button disabled={reply} type="submit" value="Send"/>
            </form>
        </div>


    )
}

export default Chat;