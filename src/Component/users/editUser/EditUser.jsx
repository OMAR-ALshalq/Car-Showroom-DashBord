import "./EditUser.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { IoIosPerson } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { FaLock } from "react-icons/fa6";
import { IoEyeOffOutline, IoEye } from "react-icons/io5";
import { FaPhoneSquareAlt } from "react-icons/fa";
import { FaSpinner } from "react-icons/fa";
import { showSuccess, showError, showConfirm } from "../../toast/Toast";

const API_URL = "https://car-showroom-server.onrender.com";

export default function EditUser({ closeModal, refreshData, userData }) {
  const [formData, setFormData] = useState({
    name: userData?.name || "",
    email: userData?.email || "",
    phoneNumber: userData?.phoneNumber,
    role: userData?.role || "user"
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
        password: "",
        confirmPassword: "",
        role: userData.role || "user"
      });
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.name.trim()) errors.push("الاسم");
    if (!formData.email.trim()) errors.push("الإيميل");

    // رقم الهاتف
    if (!formData.phoneNumber || !formData.phoneNumber.trim()) {
      errors.push("رقم الهاتف");
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      errors.push("رقم الهاتف يجب أن يكون 10 أرقام");
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ التحقق من البيانات
    const errors = validateForm();
    if (errors.length > 0) {
      showError(errors.join("، "), "بيانات غير مكتملة");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put(
        `${API_URL}/api/edit/users/${userData._id}`,
        {
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          role: formData.role,
          ...(formData.password && { password: formData.password })
        }
      );

      if (response.status === 200) {
        showSuccess(response.data.message, "تم التحديث!");
        refreshData();
        closeModal();
      }
    } catch (err) {
      showError(
        err.response?.data?.message || "حدث خطأ في السيرفر",
        "فشلت العملية"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    showConfirm(
      "لن تتمكن من استعادة بيانات هذا المستخدم بعد الحذف!",
      `هل أنت متأكد من حذف ${userData.name}؟`,
      async () => {
        setDeleting(true);
        try {
          await axios.delete(`${API_URL}/api/delete/users/${userData._id}`);
          showSuccess("تم حذف المستخدم من قاعدة البيانات", "تم الحذف!");
          refreshData();
          closeModal();
        } catch (err) {
          showError(
            err.response?.data?.message || "حدث خطأ أثناء محاولة الحذف",
            "عذراً..."
          );
        } finally {
          setDeleting(false);
        }
      }
    );
  };

  return (
    <div className="BoxAddNewUser">
      <div className="BoxFormAddUser">
        <form onSubmit={handleSubmit} dir="rtl">
          <h2>تعديل بيانات: {userData?.name}</h2>

          <label>الاسم:</label>
          <div className="box-Name">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            <IoIosPerson className="iconName" />
          </div>

          <label>رقم الهاتف:</label>
          <div className="box-number">
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
            <FaPhoneSquareAlt className="iconPhone" />
          </div>

          <label>الايميل:</label>
          <div className="box-email">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            <MdEmail className="iconEmail" />
          </div>

          <label>كلمة المرور الجديدة(اتركه فارغاً لعدم التغيير):</label>
          <div className="box-password">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            <div
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <IoEye /> : <IoEyeOffOutline />}
            </div>
          </div>

          <p>الصلاحيات:</p>
          <div className="BoxRadioRole">
            <input
              type="radio"
              name="role"
              value="admin"
              checked={formData.role === "admin"}
              onChange={handleChange}
            />
            <h4>Admin</h4>
            <input
              type="radio"
              name="role"
              value="user"
              checked={formData.role === "user"}
              onChange={handleChange}
            />
            <h4>User</h4>
          </div>

          <button
            type="button"
            className="btn-delete"
            onClick={handleDelete}
            disabled={deleting || loading}
            style={{
              opacity: deleting ? 0.7 : 1,
              cursor: deleting ? "not-allowed" : "pointer"
            }}
          >
            {deleting ? (
              <div className="Loding">
                جاري الحذف
                <FaSpinner className="spinner-icon" />
              </div>
            ) : (
              "حذف المستخدم"
            )}
          </button>
          <button
            className="btn-addUser"
            type="submit"
            disabled={loading || deleting}
            style={{
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? (
              <div className="Loding">
                جاري حفظ التعديلات
                <FaSpinner className="spinner-icon" />
              </div>
            ) : (
              "تحديث البيانات"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
