import "./AddUser.css";
import { useState } from "react";
import { IoIosPerson } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { FaLock } from "react-icons/fa6";
import { IoEyeOffOutline, IoEye } from "react-icons/io5";
import { FaPhoneSquareAlt } from "react-icons/fa";
import { showSuccess, showError } from "../../toast/Toast";

const API_URL = "https://car-showroom-server.onrender.com";


export default function AddUser({ closeModal, refreshData }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    confirmPassword: "",
    role: "user"
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const fieldName = type === "radio" ? "role" : name;
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  // ✅ دالة التحقق من البيانات
  const validateForm = () => {
    const errors = [];

    if (!formData.name.trim()) errors.push("الاسم");
    if (!formData.email.trim()) errors.push("الإيميل");
    if (!formData.password) errors.push("كلمة المرور");
    if (!formData.confirmPassword) errors.push("تأكيد كلمة المرور");

    // ✅ التحقق من رقم الهاتف
    if (!formData.phoneNumber.trim()) {
      errors.push("رقم الهاتف");
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      errors.push("رقم الهاتف يجب أن يكون 10 أرقام");
    }

    if (formData.password && formData.password.length < 6) {
      errors.push("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
    }

    if (formData.password !== formData.confirmPassword) {
      errors.push("كلمات المرور غير متطابقة");
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
      const { name, email, password, role, phoneNumber } = formData;
      const response = await fetch(
        `${API_URL}/api/add/users/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, phoneNumber, role })
        }
      );

      const data = await response.json();

      if (response.ok) {
        showSuccess("تمت إضافة المستخدم الجديد لقاعدة البيانات", "تم بنجاح!");
        setFormData({
          name: "",
          email: "",
          password: "",
          phoneNumber: "",
          confirmPassword: "",
          role: "user"
        });
        if (refreshData) refreshData();
        if (closeModal) closeModal();
      } else {
        showError(data.message || "حدث خطأ غير متوقع", "فشلت العملية");
      }
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      showError("لا يمكن الوصول إلى السيرفر حالياً", "خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="BoxAddNewUser">
      <div className="BoxFormAddUser">
        <form onSubmit={handleSubmit} dir="rtl">
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

          <label>كلمة المرور:</label>
          <div className="box-password">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
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

          <label>تاكيد كلمة المرور:</label>
          <div className="box-ConfirmPassword">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <div className="eye-icon" onClick={toggleConfirmPasswordVisibility}>
              {showConfirmPassword ? (
                <IoEye className="Eyeicon" />
              ) : (
                <IoEyeOffOutline className="Eyeicon" />
              )}
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

          <button className="btn-addUser" disabled={loading}>
            {loading ? "جاري الإضافة..." : "اضافة"}
          </button>
        </form>
      </div>
    </div>
  );
}
