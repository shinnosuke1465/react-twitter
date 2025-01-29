import React, { useEffect } from "react";
import "./App.scss";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, login, logout } from "./features/userSlice";
import { auth } from "./firebase";
import Auth from "./components/Auth";
import Feed from "./components/Feed";

const App: React.FC = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  useEffect(() => {
    const unSub = auth.onAuthStateChanged((authUser: any) => { //onAuthStateChanged()...認証状態が変わったら(ログインしたら)関数実行
      if (authUser) {  //ログインユーザーがいたら
        dispatch( //hooksのdispatch関数を使ってreduxのstoreに通知
          login({ //userの情報を更新
            uid: authUser.uid,
            photoUrl: authUser.photoURL,
            displayName: authUser.displayName,
          })
        );
      } else {
        dispatch(logout());
      }
    });
    return () => {
      unSub();
    };
  }, [dispatch]); //通知を出すたびuseEffectの中身を発火
  return (
    <>
      {user.uid ? (
        <div className="app">
          <Feed />
        </div>
      ) : (
        <Auth />
      )}
    </>
  );
};

export default App;
