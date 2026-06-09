import "./Hero.css";
import { useNavigate } from "react-router-dom";
import { showInfo, showConfirm, showError } from "../toast/Toast";
import CryptoJS from "crypto-js";
import { MdDarkMode } from "react-icons/md";
import { HiSun } from "react-icons/hi";
import { IoSunnySharp } from "react-icons/io5";
import { FaUserTie } from "react-icons/fa6";
import { Outlet, Link, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { FaUser } from "react-icons/fa6";
import { IoCarSport } from "react-icons/io5";
import { FaUserGroup } from "react-icons/fa6";
import { GoSignOut } from "react-icons/go";
import { FaThList } from "react-icons/fa";
import { GrClose } from "react-icons/gr";
import { BiSolidCategory } from "react-icons/bi";

import { useState, useEffect } from "react";

const API_URL = "https://car-showroom-server.onrender.com";


const SECRET_KEY = "My_Secret_Key_123";
const decryptRole = (encryptedRole) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedRole, SECRET_KEY);
    const originalRole = bytes.toString(CryptoJS.enc.Utf8);
    return originalRole; // سيعيد لك 'admin' أو 'user'
    // eslint-disable-next-line no-unused-vars
  } catch (e) {
    console.error("فشل فك التشفير");
    return null;
  }
};

export default function Hero() {
  const location = useLocation();

  const [showtags, setshowtags] = useState(false);
  const [animation, setAnimation] = useState("");
  function handeltags() {
    setshowtags(true);
    setAnimation("show");
  }

  function closeTags() {
    setAnimation("hide");
  }

  const user = JSON.parse(localStorage.getItem("user"));
  // console.log(user.userRole)
  const userRole = user ? decryptRole(user.userRole) : null;
  const pathnames = location.pathname.split("/").filter((x) => x);

  const navigate = useNavigate();
  const handleLogout = (e) => {
    e.preventDefault(); // منع الانتقال الفوري للرابط قبل التأكيد

    showConfirm(
      "سيتم تسجيل خروجك من لوحة التحكم",
      "هل أنت متأكد من تسجيل الخروج؟",
      // ✅ عند الموافقة
      () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    );
  };

  // 1. الحالة لتخزين الوضع الحالي

  const [isDark, setIsDark] = useState(() => {
    const savedTheme = sessionStorage.getItem("site-theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const theme = isDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    sessionStorage.setItem("site-theme", theme);
  }, [isDark]);

  return (
    <div className="BoxHero">
      <div className="continer continerHero">
        <div className="NavBarHero" id="NavBar">
          <div className="icon-NavBarHero">
            <h3>AlmalihMotors</h3>
          </div>
          <div className="DarkMod-User-profile">
            <div className="DarkMode" onClick={() => setIsDark(!isDark)}>
              {isDark ? (
                <HiSun /> // تظهر أيقونة الشمس عندما يكون الوضع داكناً للعودة للفاتح
              ) : (
                <MdDarkMode /> // تظهر أيقونة القمر عندما يكون الوضع فاتحاً للتحويل للداكن
              )}
            </div>
            <div className="User-profile">
              <Link
                to=""
                onClick={(e) => {
                  e.preventDefault(); // يمنع الانتقال إلى الصفحة
                  showInfo(
                    `${user.userName} | ${user.userEmail} | ${userRole}`,
                    "معلومات المستخدم"
                  );
                }}
              >
                <FaUserTie />
              </Link>
            </div>
          </div>
        </div>
        <div className="BoxUrl" id="UrlBar">
          <div className="Url">
            <p>
              <Link to="/">Login</Link>
              {pathnames.map((name, index) => {
                // بناء المسار تدريجياً لكل كلمة
                const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
                const isLast = index === pathnames.length - 1;

                return (
                  <span key={name}>
                    {" / "}
                    {isLast ? (
                      <span style={{ textTransform: "capitalize" }}>
                        {name}
                      </span>
                    ) : (
                      <Link
                        to={routeTo}
                        style={{ textTransform: "capitalize" }}
                      >
                        {name}
                      </Link>
                    )}
                  </span>
                );
              })}
            </p>
            <h3 style={{ textTransform: "capitalize" }}>
              {pathnames.length > 0
                ? pathnames[pathnames.length - 1]
                : "Dashboard"}
            </h3>
          </div>
        </div>
        <div className="BoxHero">
          <div className="Hero">
            <div className="SidBarHero">
              <div className="User-Name">
                <div className="User-Name-Icon">
                  <FaUser />
                </div>
                <div className="User-Name-Text">
                  <h3>{user.userName}</h3>
                </div>
              </div>
              <div className="Links-Box" dir="rtl">
                <HashLink smooth to="allCar#AllCar">
                  <div className="LinkCar">
                    <IoCarSport className="Links-Icon" />
                    السيارات
                  </div>
                </HashLink>

                <HashLink
                  smooth
                  to="alluser#AllUser"
                  onClick={(e) => {
                    if (userRole === "user") {
                      e.preventDefault(); // يمنع الانتقال إلى الصفحة
                      showError(
                        "ليس لديك صلاحيات الوصول إلى صفحة المستخدمين",
                        "عذراً!"
                      );
                    }
                  }}
                >
                  <div className="LinkUser">
                    <FaUserGroup className="Links-Icon" />
                    المستدمين
                  </div>
                </HashLink>
                <HashLink
                  to="Classification#Head"
                  onClick={(e) => {
                    if (userRole === "user") {
                      e.preventDefault(); // يمنع الانتقال إلى الصفحة
                      showError(
                        "ليس لديك صلاحيات الوصول إلى صفحة المستخدمين",
                        "عذراً!"
                      );
                    }
                  }}
                >
                  <div className="LinkUser">
                    <BiSolidCategory className="Links-Icon" />
                    التصنيفات
                  </div>
                </HashLink>
                <Link to="/login" onClick={handleLogout}>
                  <div className="SignOut">
                    <GoSignOut className="Links-Icon" />
                    تسجيل دخول
                  </div>
                </Link>
              </div>
              <div className="LinkList">
                <FaThList onClick={handeltags} />
              </div>
            </div>
            <div className="bodyHero">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
      {showtags && (
        <div
          className={`tagsTow ${
            animation === "show" ? "animateShow" : "animateHide"
          }`}
          onAnimationEnd={() => {
            if (animation === "hide") setshowtags(false);
          }}
        >
          <div className="divClosTags">
            <GrClose className="Closeicon" onClick={closeTags} />
          </div>
          <div className="ListLinkTags">
            <HashLink smooth to="allCar#NavBar" onClick={closeTags}>
              <div className="LinkCar">
                <IoCarSport className="Links-Icon" />
                السيارات
              </div>
            </HashLink>

            <HashLink
              smooth
              to="alluser#NavBar"
              onClick={(e) => {
                if (userRole === "user") {
                  e.preventDefault(); // يمنع الانتقال إلى الصفحة
                  showError(
                    "ليس لديك صلاحيات الوصول إلى صفحة المستخدمين",
                    "عذراً!"
                  );
                }
                closeTags();
              }}
            >
              <div className="LinkUser">
                <FaUserGroup className="Links-Icon" />
                المستخدمون
              </div>
            </HashLink>
            <HashLink
              smooth
              to="Classification#NavBar"
              onClick={(e) => {
                if (userRole === "user") {
                  e.preventDefault(); // يمنع الانتقال إلى الصفحة
                  showError(
                    "ليس لديك صلاحيات الوصول إلى صفحة المستخدمين",
                    "عذراً!"
                  );
                }
                closeTags();
              }}
            >
              <div className="LinkUser">
                <BiSolidCategory className="Links-Icon" />
                التصنيفات
              </div>
            </HashLink>
            <Link to="/login" onClick={handleLogout}>
              <div className="SignOut">
                <GoSignOut className="Links-Icon" />
                تسجيل خروج
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
