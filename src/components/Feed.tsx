// import React, { useState, useEffect } from "react";
// import styles from "./Feed.module.scss";
// import { db } from "../firebase";
// import TweetInput from "./TweetInput";
// import Post from "./Post";

// const Feed: React.FC = () => {
//   const [posts, setPosts] = useState([ //投稿を格納するためのstate
//     {
//       id: "",
//       avatar: "",
//       image: "",
//       text: "",
//       timestamp: null,
//       username: "",
//     },
//   ]);

//   useEffect(() => {
//     const unSub = db
//       .collection("posts") //DBを指定
//       .orderBy("timestamp", "desc") //新しいものが先頭に来る
//       .onSnapshot((snapshot) =>
//         setPosts( //配列としてposts[]に要素を格納
//           snapshot.docs.map((doc) => ({ //snapshot.docs....postsの中にあるドキュメントを全て取得できる
//             id: doc.id,
//             avatar: doc.data().avatar,
//             image: doc.data().image,
//             text: doc.data().text,
//             timestamp: doc.data().timestamp,
//             username: doc.data().username,
//           }))
//         )
//       );
//     return () => {
//       unSub();
//     };
//   }, []); //このコンポーネント(Feed.tsx)がマウントしたときに実行

//   return (
//     <div className={styles.feed}>
//       <TweetInput />

//       {posts[0]?.id && (
//         <>
//           {posts.map((post) => (
//             <Post
//               key={post.id}
//               postId={post.id}
//               avatar={post.avatar}
//               image={post.image}
//               text={post.text}
//               timestamp={post.timestamp}
//               username={post.username}
//             />
//           ))}
//         </>
//       )}
//     </div>
//   );
// };

// export default Feed;
