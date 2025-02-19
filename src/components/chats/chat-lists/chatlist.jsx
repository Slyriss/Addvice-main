import React, { useState } from "react";
import { useUserStore } from "../../../lib/userStore";
import { useChatStore } from "../../../lib/chatStore";
import { db } from "../../updateProfile/firebaseConfig";
import { useEffect } from "react";
import { doc } from "firebase/firestore";
import {
  onSnapshot,
  userDocRef,
  userDocSnap,
  getDoc,
  docRef,
} from "firebase/firestore";
import "./chatlist.css";
import AddUser from "../../addUser/addUser";

const Chatlist = () => {
  const [addmode, setAddMode] = useState(false);
  const [chats, setChats] = useState([]);

  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        const items = res.data().chats;

        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);

          const user = userDocSnap.data();

          return { ...item, user };
        });

        const chatData = await Promise.all(promises);

        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      },
    );

    return () => {
      unsub();
    };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    changeChat(chat.chatId, chat.user);
  };

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src={require("../chat-images/search.png")} alt="Search" />
          <input type="text" placeholder="Search" />
        </div>
        <img
          src={
            addmode
              ? require("../chat-images/plus.png")
              : require("../chat-images/minus.png")
          }
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>
      {chats.map((chat) => (
        <div
          className="item"
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
        >
          <img src={chat.user.avatar || "../chat-images/avatar.png"} alt="" />
          <div className="texts">
            <span>{chat.user.name}</span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}
      {addmode && <AddUser />}
    </div>
  );
};

export default Chatlist;
