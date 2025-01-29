import React, { useState } from "react";
import "./TweetInput.module.scss";
import { storage, db, auth } from "../firebase";
import firebase from "firebase/app";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";


const TweetInput: React.FC = () => {
  const user = useSelector(selectUser);
  const [tweetImage, setTweetImage] = useState<File | null>(null);
  const [tweetMsg, setTweetMsg] = useState("");

  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files![0]) {
      setTweetImage(e.target.files![0]);
      e.target.value = "";
    }
  };
  const sendTweet = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); //この関数が発火されたときにページをリロードしない
    if (tweetImage) { //画像が選択されている場合とされていない場合で条件分岐(投稿のみ保存するのか、投稿と画像の二つを保存するのか)
      //画像のファイルname登録処理
      const S =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const N = 16;
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join("");
      const fileName = randomChar + "_" + tweetImage.name;
      //firebaseのstorageの中のimagesフォルダの配下に上記のファイルを保存していく
      const uploadTweetImg = storage.ref(`images/${fileName}`).put(tweetImage);
      uploadTweetImg.on( //上記のfirebaseのstorageに変更があった場合に発火する
        firebase.storage.TaskEvent.STATE_CHANGED,
        () => {},  //第二引数には進捗などを定義できるが今回は指定しないため空の関数にする
        (err) => { //第三引数にはエラー内容を表示する
          alert(err.message);
        },
        async () => { //正常に処理が通った場合。
          await storage
            .ref("images")
            .child(fileName)
            .getDownloadURL() //storageに保存した画像ファイルのurlを取得
            .then(async (url) => { //上記の処理が通った場合取得したurl(画像データ)と投稿データをDBに保存
              await db.collection("posts").add({ //DBのどこにデータを登録するのか指定
                avatar: user.photoUrl, //追加したいオブジェクトを指定指定いく
                image: url,
                text: tweetMsg,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                username: user.displayName,
              });
            });
        }
      );
    } else {
      db.collection("posts").add({
        avatar: user.photoUrl,
        image: "",
        text: tweetMsg,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        username: user.displayName,
      });
    }
    //投稿が終わった後入力内容をリセット
    setTweetImage(null);
    setTweetMsg("");
  };

  return (
    <>
      <form onSubmit={sendTweet}>
        <div className="tweet_form">
          <img
            className="tweet_avatar"
            src={user.photoUrl}
            onClick={async () => {
              await auth.signOut();
            }}
          />
          <input
            className="tweet_input"
            placeholder="What's happening?"
            type="text"
            autoFocus
            value={tweetMsg}
            onChange={(e) => setTweetMsg(e.target.value)}
          />
          <div>
            <label>
              <div
                className={
                  tweetImage ? "tweet_addIconLoaded" : "tweet_addIcon"
                }
              />
              <input
                className="tweet_hiddenIcon"
                type="file"
                onChange={onChangeImageHandler}
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={!tweetMsg}
          className={
            tweetMsg ? "tweet_sendBtn" : "tweet_sendDisableBtn"
          }
        >
          Tweet
        </button>
      </form>
    </>
  );
}

export default TweetInput;
