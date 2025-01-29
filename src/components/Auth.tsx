import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { updateUserProfile } from "../features/userSlice";
import "./Auth.module.scss";
import { auth, provider, storage } from "../firebase";

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const Auth: React.FC = () => {

  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatarImage, setAvatarImage] = useState<File | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [openModal, setOpenModal] = React.useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files![0]) {
      setAvatarImage(e.target.files![0]);
      e.target.value = "";
    }
  };
  const sendResetEmail = async (e: React.MouseEvent<HTMLElement>) => {
    await auth
      .sendPasswordResetEmail(resetEmail)
      .then(() => {
        setOpenModal(false);
        setResetEmail("");
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          alert(err.message);
        } else {
          alert("予期しないエラーが発生しました");
        }
      });
  };
  const signInGoogle = async () => {//処理が終わるのを待つ
    await auth.signInWithPopup(provider).catch((err: unknown) => {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("予期しないエラーが発生しました");
      }
    });
  };
  //firebaseのEmailログインの機能使う
  const signInEmail = async () => {
    await auth.signInWithEmailAndPassword(email, password);
  };
  const signUpEmail = async () => {
    const authUser = await auth.createUserWithEmailAndPassword(email, password);
    let url = "";
    if (avatarImage) {
      const S =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const N = 16;
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join("");
      const fileName = randomChar + "_" + avatarImage.name;
      await storage.ref(`avatars/${fileName}`).put(avatarImage);
      url = await storage.ref("avatars").child(fileName).getDownloadURL();
    }
    await authUser.user?.updateProfile({
      displayName: username,
      photoURL: url,
    });
    dispatch(
      updateUserProfile({
        displayName: username,
        photoUrl: url,
      })
    );
  };

  return (
    <main className="root">
      <div className="image" />
      <div>
        <div className="paper">
          <div className="avatar">
            {/* <LockOutlinedIcon /> */}
          </div>
          <div>
            {isLogin ? "Login" : "Register"}
          </div>
          <form className="form" noValidate>
            {!isLogin && (
              <>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Username"
                  autoComplete="username"
                  autoFocus
                  required
                  value={username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setUsername(e.target.value);
                  }}
                />
                <div>
                  <div>
                    <label>
                      <div
                        className={
                          avatarImage
                            ? "login_addIconLoaded"
                            : "login_addIcon"
                        }
                      />
                      <input
                        className="hidden-icon"
                        type="file"
                        onChange={onChangeImageHandler}
                      />
                    </label>
                  </div>
                </div>
              </>
            )}
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email Address"
              autoComplete="email"
              required
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
              }}
            />
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value);
              }}
            />

            <button
              type="button"
              className="submit"
              disabled={
                isLogin
                  ? !email || password.length < 6
                  : !username || !email || password.length < 6 || !avatarImage
              }
              onClick={
                isLogin
                  ? async () => {
                    try {
                      await signInEmail();
                    } catch (err: any) {
                      alert(err.message);
                    }
                  }
                  : async () => {
                    try {
                      await signUpEmail();
                    } catch (err: any) {
                      alert(err.message);
                    }
                  }
              }
            >
              {isLogin ? "Login" : "Register"}
            </button>
            <div>
              <div>
                <span
                  className="login_reset"
                  onClick={() => setOpenModal(true)}
                >
                  Forgot password ?
                </span>
              </div>
              <div>
                <span
                  className="login_toggleMode"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Create new account ?" : "Back to login"}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="submit google"
              onClick={signInGoogle}
            >
              SignIn with Google
            </button>
          </form>
          <div>
            {/* <div onclick={openModal} onClose={() => setOpenModal(false)}> */}
            <div style={getModalStyle()} className="modal">
              <div className="login_modal">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email Address"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setEmail(e.target.value);
                  }}
                />
                <div onClick={sendResetEmail}>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
export default Auth;
