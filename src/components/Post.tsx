import React, { useState, useEffect } from "react";
import "./Post.module.scss";
import { db } from "../firebase";
import firebase from "firebase/app";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";

interface PROPS { //親要素(Feed.tsx)から渡されたデータの型を定義
  postId: string;
  avatar: string;
  image: string;
  text: string;
  timestamp: any;
  username: string;
}

interface COMMENT {  //DBから取得するコメントデータの型定義
  id: string;
  avatar: string;
  text: string;
  timestamp: any;
  username: string;
}


const Post: React.FC<PROPS> = (props) => { //<PROPS>..上記で指定した親要素(Feed.tsx)から渡されたデータの型を定義のこと
  const user = useSelector(selectUser);
  const [openComments, setOpenComments] = useState(false);
  const [comment, setComment] = useState(""); //DBにコメントを登録するための変数
  const [comments, setComments] = useState<COMMENT[]>([//DBからコメントを取得するための変数
    {
      id: "",
      avatar: "",
      text: "",
      username: "",
      timestamp: null,
    },
  ]);

  useEffect(() => {
    const unSub = db
      .collection("posts") //DB(postsコレクション)を指定
      .doc(props.postId) //postsコレクションの中の指定の投稿Idに一致する投稿を取得
      .collection("comments") //一致した投稿の配下にあるcommentsコレクションを指定
      .orderBy("timestamp", "desc") //新しいものが先頭に来る
      .onSnapshot((snapshot) => {
        setComments( //配列としてcomments[]に要素を格納
          snapshot.docs.map((doc) => ({ //commentsコレクションのコメントをそれぞれループして配列として格納
            id: doc.id,
            avatar: doc.data().avatar,
            text: doc.data().text,
            username: doc.data().username,
            timestamp: doc.data().timestamp,
          }))
        );
      });
    //クリーンアップ関数
    return () => {
      unSub();
    };
  }, [props.postId]);

  const newComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); //この関数が発火されたときにページをリロードしない
    //postsコレクションの中の投稿のidにコメントコレクションを紐づける
    db.collection("posts").doc(props.postId).collection("comments").add({
      avatar: user.photoUrl,
      text: comment,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      username: user.displayName,
    });
    //コメント投稿保存が終わった後入力内容をリセット
    setComment("");
  };
  return (
    <div className="post">
      <div className="post_avatar">
        <img src={props.avatar} />
      </div>
      <div className="post_body">
        <div>
          <div className="post_header">
            <h3>
              <span className="post_headerUser">@{props.username}</span>
              <span className="post_headerTime">
                {new Date(props.timestamp?.toDate()).toLocaleString()}
              </span>
            </h3>
          </div>
          <div className="post_tweet">
            <p>{props.text}</p>
          </div>
        </div>
        {props.image && (
          <div className="post_tweetImage">
            <img src={props.image} />
          </div>
        )}

        <div
          className="post_commentIcon"
          onClick={() => setOpenComments(!openComments)}
        >
          コメント追加
        </div>

        {openComments && (
          <>
            {comments.map((com) => (
              <div key={com.id} className="post_comment">
                <img src={com.avatar} />

                <span className="post_commentUser">@{com.username}</span>
                <span className="post_commentText">{com.text} </span>
                <span className="post_headerTime">
                  {new Date(com.timestamp?.toDate()).toLocaleString()}
                </span>
              </div>
            ))}

            <form onSubmit={newComment}>
              <div className="post_form">
                <input
                  className="post_input"
                  type="text"
                  placeholder="Type new comment..."
                  value={comment}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setComment(e.target.value)
                  }
                />
                <button
                  disabled={!comment}
                  className={
                    comment ? "post_button" : "post_buttonDisable"
                  }
                  type="submit"
                >
                  <img className="post_sendIcon" />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Post;
