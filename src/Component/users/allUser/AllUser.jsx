import "./AllUser.css";
import React from "react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { IoIosPersonAdd } from "react-icons/io";
import { FaUser } from "react-icons/fa6";
import { FiSearch } from "react-icons/fi"; // أضفت أيقونة البحث
import { IoCloseCircleSharp } from "react-icons/io5";

const API_URL = "https://car-showroom-server.onrender.com";


import axios from "axios";
import { showSuccess, showError, showConfirm } from "../../toast/Toast";
import Loader from "../../loader/Loader";
import AddUser from "../addUser/AddUser";
import EditUser from "../editUser/EditUser";

export default function AllUser() {
  const [users, setusers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // حالة البحث بالاسم
  const [filterRole, setFilterRole] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true); // ✅ أظهر اللودر
      const response = await fetch(`${API_URL}/api/users`);
      const data = await response.json();
      setusers(data.users);
    } catch (error) {
      console.error("خطأ في جلب السيارات:", error);
    } finally {
      setLoading(false); // ✅ أخفِ اللودر
    }
  };
  useEffect(() => {
    fetchUser();
  }, []);

  const handleDelete = (userId, userName) => {
    showConfirm(
      "لن تتمكن من استعادة بيانات هذا المستخدم بعد الحذف!",
      `هل أنت متأكد من حذف ${userName}؟`,
      // ✅ عند الموافقة
      async () => {
        try {
          const response = await axios.delete(
            `${API_URL}/api/delete/users/${userId}`
          );
          if (response.status === 200) {
            showSuccess("تم حذف المستخدم من قاعدة البيانات", "تم الحذف!");
            fetchUser();
          }
        } catch (err) {
          showError(
            err.response?.data?.message || "حدث خطأ أثناء محاولة الحذف",
            "عذراً..."
          );
        }
      }
    );
  };
  const filteredUsers = users.filter((user) => {
    const matchesName = user.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesName && matchesRole;
  });
  return (
    <div className="BoxAllUser" id="AllUser">
      {loading && <Loader text="جاري تحميل المستخدمين..." />}

      {showAddUser && (
        <div className="AddUser-overlay">
          <div className="AddUser-content">
            <button className="btn-close" onClick={() => setShowAddUser(false)}>
              <IoCloseCircleSharp />
            </button>
            <AddUser
              closeModal={() => setShowAddUser(false)}
              refreshData={fetchUser}
            />
          </div>
        </div>
      )}
      {showEditUser && (
        <div className="EditUser-overlay">
          <div className="EditUser-content">
            <button
              className="btn-close"
              onClick={() => {
                setShowEditUser(false);
                setSelectedUser(null);
              }}
            >
              <IoCloseCircleSharp />
            </button>
            <EditUser
              closeModal={() => setShowEditUser(false)}
              refreshData={fetchUser}
              userData={selectedUser}
            />
          </div>
        </div>
      )}
      <div className="BoxAddUser" dir="rtl">
        <button className="btn-AddUser" onClick={() => setShowAddUser(true)}>اضافة مستخدم</button>
        <div className="filtercontiner">
          <div className="filterBoxButton">
            <button
              className={`FilterBtn ${filterRole === "all" ? "active" : ""}`}
              onClick={() => {
                setFilterRole("all");
                setSearchTerm("");
              }}
            >
              الكل
            </button>
            <button
              className={`FilterBtn ${filterRole === "admin" ? "active" : ""}`}
              onClick={() => setFilterRole("admin")}
            >
              المدراء
            </button>
            <button
              className={`FilterBtn ${filterRole === "user" ? "active" : ""}`}
              onClick={() => setFilterRole("user")}
            >
              المستخدمين
            </button>
          </div>
          <div className="SearchBox">
            <FiSearch className="SearchIcon" />
            <input
              type="text"
              placeholder="ابحث عن طريق الاسم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid-table-user">
        <span className="table-header">Id</span>
        <span className="table-header">Name</span>
        <span className="table-header">Email</span>
        <span className="table-header">Role</span>
        <span className="table-header">Action</span>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <React.Fragment key={user._id}>
              <div className="table-cell">{user._id.substring(0, 10)}</div>
              <div className="table-cell">{user.name}</div>
              <div className="table-cell">{user.email}</div>
              <div className="table-cell">{user.role}</div>
              <div className="table-cell">
                <button
                  className="buttonEdit"
                  onClick={() => {
                    setShowEditUser(true);
                    setSelectedUser(user);
                  }}
                >
                  تعديل
                </button>
                <button
                  className="buttonDelete"
                  onClick={() => handleDelete(user._id, user.name)}
                >
                  حذف
                </button>
              </div>
            </React.Fragment>
          ))
        ) : (
          <div className="NoUsersMsg" dir="rtl">
            لا يوجد مستخدمين يطابقون بحثك..
          </div>
        )}
      </div>
      <div className="BoxCardUser">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              className="CardUser"
              onClick={() => {
                setShowEditUser(true);
                setSelectedUser(user);
              }}
            >
              <div className="BoxinfoUser">
                <div className="TitleUser">
                  <div className="User-Name-Icon">
                    <FaUser />
                  </div>
                </div>
                <div className="NameUser">
                  <h3>{user.name}</h3>
                </div>
                <div className="EmailUser">
                  <h4>{user.email}</h4>
                </div>
                <div className="RoleUser">
                  <p
                    style={{ background: user.role === "admin" ? "green" : "" }}
                  >
                    {user.role}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="NoUsersMsg" dir="rtl">
            لا يوجد مستخدمين يطابقون بحثك..
          </div>
        )}
      </div>
    </div>
  );
}
