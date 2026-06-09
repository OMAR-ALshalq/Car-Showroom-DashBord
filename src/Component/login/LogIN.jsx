import "./LogIN.css";
import { useState } from "react";
import axios from "axios";
import { showSuccess, showError } from "../toast/Toast";
import { useNavigate } from "react-router-dom";
import WelcomeScreen from "./WelcomeScreen";

import { FaUserLarge } from "react-icons/fa6";
import { FaLock } from "react-icons/fa6";
import { IoEyeOffOutline } from "react-icons/io5";
import { IoEye } from "react-icons/io5";

const API_URL = "https://car-showroom-server.onrender.com";


export default function LogIN() {
  const [showWelcome, setShowWelcome] = useState(true); // ✅ جديدة
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_URL}/api/login`, {
        email: email,
        password: password
      });

      if (response.status === 200) {
        const { token, user } = response.data;
        showSuccess(`أهلاً بك يا ${user.userName}`, "تم تسجيل الدخول بنجاح");

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        setTimeout(() => {
          navigate("/Dashbord");
        }, 2000);
      }
    } catch (err) {
      let errorMsg = "تعذر الاتصال بالسيرفر";

      if (err.response) {
        errorMsg = err.response.data.message;
      }

      showError(errorMsg, "فشل الدخول");
    }
  };

  //  showWelcome = true، نعرض الواجهة الترحيبية
  if (showWelcome) {
    return <WelcomeScreen onFinish={() => setShowWelcome(false)} />;
  }

  return (
    <div className="Box">
      <div className="continer continerLogIN">
        <div className="BoxFormLogin">
          <form onSubmit={handleLogin}>
            {/* استبدل svg الحالي بهذا */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
              viewBox="-5.0 -10.0 110.0 90.0"
              className="car-logo-svg"
            >
              <path d="m92.918 46.125c-1.5547-3.3203-3.3555-2.5781-4.4492-3.9219-2.1523-2.6367-5.0742-2.6953-5.3359-3.9922-0.25781-1.293-2-2.2578-2-2.2578s2-0.070313 4.7109-0.30469c2.707-0.23438 2.6602-2.0938 0.70703-3.6016s-8.3594-1.3672-8.3594-1.3672l1.3203 3.3906c-2.3555-4.5234-8.668-11.68-10.574-12.105-1.9102-0.42578-18.938-1.0586-18.938-1.0586s-17.027 0.63672-18.934 1.0586-8.2188 7.5859-10.574 12.105l1.3203-3.3906s-6.4062-0.14063-8.3594 1.3672-2 3.3672 0.70703 3.6016c2.707 0.23828 4.7109 0.30469 4.7109 0.30469s-1.7422 0.96484-2 2.2578c-0.25781 1.2969-3.1797 1.3516-5.3359 3.9922-1.0977 1.3438-2.8984 0.60156-4.4531 3.9219 0 0-3.5469 5.7461-0.90625 26.375l-0.61328 1s7.2539 5.4062 44.438 5.5938c37.184-0.1875 44.438-5.5938 44.438-5.5938l-0.61328-1c2.6367-20.629-0.90625-26.375-0.90625-26.375zm-67.434-14.27c1.7656-2.9688 3.6016-6.0039 3.6016-6.0039s1.1289-1.4141 5.2266-1.5547c4.1016-0.14062 15.688-0.35547 15.688-0.35547s11.586 0.21094 15.684 0.35156 5.2266 1.5547 5.2266 1.5547 1.8359 3.0391 3.6016 6.0039c1.7656 2.9688-1.2031 2.543-1.2031 2.543l-46.621 0.003907s-2.9688 0.42187-1.2031-2.543zm43.613 22.844c-2.1211 3.582-12.906 2.6367-14.414 2.5938-1.5078-0.046875-2.7812-0.37891-3.0156-1.1328s-0.51953-2.0703-0.42188-4.1914c0.09375-2.1172 2.0742-2.4336 3.0625-2.4961 3.6094-0.21875 11.492 0.046875 14.461 0.33203 2.9648 0.28125 2.4492 1.3125 0.32812 4.8945zm-20.77 1.4609c-0.23438 0.75391-1.5078 1.0859-3.0156 1.1328s-12.293 0.98828-14.414-2.5938c-2.1172-3.5781-2.6367-4.6133 0.32812-4.8984 2.9688-0.28125 10.852-0.55469 14.461-0.33203 0.98438 0.0625 2.9688 0.37891 3.0625 2.4961 0.09375 2.1211-0.1875 3.4414-0.42188 4.1953zm-39.516-6.4336c0.28125-2.8945 0.70703-3.6016 0.70703-3.6016s3.2266-0.86719 4.6875 0c1.4609 0.87109 7.4883 3.2266 12.766 3.875 0 0 0.082032 1.6836 0.62891 2.9766 0 0-2.75-0.09375-3.7148 0.80078-0.96484 0.89453-2.4258 1.4141-4.8516 1.0352-2.4258-0.375-10.504-2.1875-10.223-5.0859zm2.1914 20.562-0.84766-8.0547s7.2773 0.21094 10.457 1.4141c3.1797 1.2031 6.3594 3.6719 6.3594 3.6719-10.598-3.5312-15.188-1.3438-13.848 2.8281 1.3438 4.168 7.4883 5.2969 7.4883 5.2969-9.1172 0.5625-9.6094-5.1562-9.6094-5.1562zm62.004 3.1562c-1.8984 1.9609-23.008 2.4453-23.008 2.4453s-21.109-0.48438-23.008-2.4453c-0.69531-0.71875 3.5781-6.9375 6.6523-7.1484 2.0625-0.14062 30.645-0.14062 32.711 0 3.0742 0.21094 7.3477 6.4258 6.6523 7.1484zm15.988-3.1562s-0.49219 5.7227-9.6094 5.1562c0 0 6.1484-1.1328 7.4883-5.2969 1.3438-4.168-3.25-6.3594-13.848-2.8281 0 0 3.1797-2.4727 6.3594-3.6719 3.1797-1.1992 10.457-1.4141 10.457-1.4141zm-8.0273-15.473c-2.4258 0.375-3.8867-0.14062-4.8516-1.0352-0.96484-0.89844-3.7148-0.80078-3.7148-0.80078 0.54688-1.2969 0.62891-2.9805 0.62891-2.9805 5.2734-0.64844 11.305-3.0039 12.766-3.875 1.4609-0.86719 4.6875 0 4.6875 0s0.42188 0.70703 0.70703 3.6016c0.27734 2.8984-7.8008 4.7109-10.223 5.0898z" />
              <path d="m54.379 56.797h0.91797v-6.2422h-0.77344z" />
              <path d="m57.676 56.797h0.91797v-6.2422h-0.77734z" />
              <path d="m60.312 56.676h0.92188v-6.2422h-0.77734z" />
              <path d="m62.977 56.676 0.91797-0.18359v-6.0586h-0.77734z" />
              <path d="m65.355 56.246 0.91797-0.26562v-5.5469h-0.77734z" />
              <path d="m68.008 55.074 0.91797-1.1523v-3.3672h-0.77734z" />
              <path d="m44.703 50.555v6.2422h0.91797l-0.14453-6.2422z" />
              <path d="m41.406 50.555v6.2422h0.91797l-0.14453-6.2422z" />
              <path d="m38.766 50.434v6.2422h0.92188l-0.14453-6.2422z" />
              <path d="m36.105 50.434v6.0586l0.91797 0.18359-0.14063-6.2422z" />
              <path d="m33.727 50.434v5.5469l0.91797 0.26562-0.14062-5.8125z" />
              <path d="m31.074 50.555v3.3672l0.91797 1.1523-0.14063-4.5195z" />
            </svg>
            <label>Login</label>
            <div className="boxInput">
              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FaUserLarge className="iconEmail" />
            </div>
            <div className="boxInput">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Your Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FaLock className="iconPassword" />
              <div className="eye-icon" onClick={togglePasswordVisibility}>
                {showPassword ? (
                  <IoEye className="Eyeicon" />
                ) : (
                  <IoEyeOffOutline className="Eyeicon" />
                )}
              </div>
            </div>
            <div className="boxdata">
              <label>Forgat Password?</label>
            </div>
            <button type="submit">Log in</button>
          </form>
        </div>
      </div>
    </div>
  );
}
