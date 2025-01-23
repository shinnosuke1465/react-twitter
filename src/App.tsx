//必要な機能import
import React, { useEffect } from "react";
// import styles from "./";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, login, logout } from "./features/userSlice";
import { auth } from "./firebase";
// import Auth from "./components/Auth";

//アロー関数にしてReact.FCで型付け
const App: React.FC = () => {
  return (
    // <div className={styles.app}></div>
  );
};

export default App;