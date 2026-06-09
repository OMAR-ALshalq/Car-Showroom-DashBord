import "./EditCar.css";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useParams } from "react-router-dom";
import { AiFillDelete } from "react-icons/ai";
import { FiEdit2 } from "react-icons/fi";
import { IoIosAddCircleOutline } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { MdKeyboardArrowDown } from "react-icons/md";
import { showSuccess, showError, showConfirm } from "../../toast/Toast";

const API_URL = "https://car-showroom-server.onrender.com";


export default function EditCar() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const [activeImg, setActiveImg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editingPath, setEditingPath] = useState({
    category: null,
    index: null
  });
  const addNewImageRef = useRef(null);
  const [CarData, setCarData] = useState({
    brand: "",
    model: "",
    bodyType: "",
    year: "",
    price: "",
    color: "",
    images: [],
    status: "available",
    mileage: { value: "", unit: "km" },
    engine: {
      cylinders: "",
      horsepower: "",
      capacityLitre: "",
      capacityCC: "",
      transmission: "automatic",
      fulType: ""
    },
    safetyFeatures: [],
    comfortFeatures: [],
    techFeatures: [],
    description: ""
  });

  // ✅ أنيميشن القوائم
  const [brandAnimation, setBrandAnimation] = useState("show");
  const [modelAnimation, setModelAnimation] = useState("show");
  const [bodyTypeAnimation, setBodyTypeAnimation] = useState("show");

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/cars/${id}`
        );
        setCarData(response.data);
        if (response.data.images?.length > 0)
          setActiveImg(response.data.images[0]);
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
      }
    };
    if (id) fetchCarDetails();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setCarData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setCarData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddNewImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default");
    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dn0wvuirg/image/upload",
        { method: "POST", body: formData }
      );
      const data = await response.json();
      if (data.secure_url) {
        setCarData((prev) => ({
          ...prev,
          images: [...prev.images, data.secure_url]
        }));
        setActiveImg(data.secure_url);
        showSuccess("تمت إضافة الصورة الجديدة بنجاح");
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      showError("فشل رفع الصورة الجديدة");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteActiveImage = () => {
    showConfirm(
      "سيتم حذف هذه الصورة من القائمة",
      "هل أنت متأكد من حذف الصورة؟",
      () => {
        const newImages = CarData.images.filter((img) => img !== activeImg);
        setCarData((prev) => ({ ...prev, images: newImages }));
        setActiveImg(newImages[0] || "");
        showSuccess("تم حذف الصورة");
      }
    );
  };

  const handleReplaceImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default");
    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dn0wvuirg/image/upload",
        { method: "POST", body: formData }
      );
      const data = await response.json();
      const newImages = CarData.images.map((img) =>
        img === activeImg ? data.secure_url : img
      );
      setCarData((prev) => ({ ...prev, images: newImages }));
      setActiveImg(data.secure_url);
      showSuccess("تم استبدال الصورة بنجاح");
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      showError("فشل رفع الصورة الجديدة");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${API_URL}/api/edit/cars/${id}`,
        CarData
      );
      showSuccess(response.data.message);
      setTimeout(() => navigate("/Dashbord/allCar"), 1500);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      showError("فشل التعديل، تأكد من اتصال السيرفر");
    }
  };

  const addNewFeature = (category, value) => {
    if (!value.trim()) return;
    setCarData((prev) => ({ ...prev, [category]: [...prev[category], value] }));
  };
  const renderAddInput = (category) => (
    <input
      type="text"
      placeholder="+ أضف ميزة جديدة..."
      className="add-feature-input"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          addNewFeature(category, e.target.value);
          e.target.value = "";
        }
      }}
    />
  );
  const handleFeatureChange = (category, index, newValue) => {
    setCarData((prev) => {
      const updatedCategory = [...prev[category]];
      updatedCategory[index] = newValue;
      return { ...prev, [category]: updatedCategory };
    });
  };
  const renderFeatureItem = (category, index, value) => {
    const isEditing =
      editingPath.category === category && editingPath.index === index;
    if (isEditing)
      return (
        <input
          autoFocus
          className="feature-input-active"
          value={value}
          onChange={(e) => handleFeatureChange(category, index, e.target.value)}
          onBlur={() => setEditingPath({ category: null, index: null })}
          onKeyDown={(e) => {
            if (e.key === "Enter")
              setEditingPath({ category: null, index: null });
          }}
        />
      );
    return (
      <p
        className="feature-text-view"
        onClick={() => setEditingPath({ category, index })}
        title="انقر للتعديل"
      >
        {value}
      </p>
    );
  };

  const handleDelete = () => {
    showConfirm(
      "لن تتمكن من استعادة بيانات السيارة بعد الحذف!",
      "هل أنت متأكد من الحذف؟",
      async () => {
        try {
          await axios.delete(`${API_URL}/api/delete/cars/${id}`);
          showSuccess("تم حذف السيارة بنجاح");
          setTimeout(() => navigate("/Dashbord/allCar"), 1500);
        } catch (err) {
          showError(err.response?.data?.message || "حدث خطأ أثناء الحذف");
        }
      }
    );
  };

  const [allBrands, setAllBrands] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [allModels, setAllModels] = useState([]);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const modelDropdownRef = useRef(null);

  const [allBodyTypes, setAllBodyTypes] = useState([]);
  const [isBodyTypeOpen, setIsBodyTypeOpen] = useState(false);
  const bodyTypeDropdownRef = useRef(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/brands-with-count`)
      .then((res) => {
        if (res.data.success) setAllBrands(res.data.data);
      })
      .catch((err) => console.error(err));
    axios
      .get(`${API_URL}/api/unique-models`)
      .then((res) => {
        if (res.data.success) setAllModels(res.data.data);
      })
      .catch((err) => console.error(err));
    axios
      .get(`${API_URL}/api/body-types`)
      .then((res) => {
        if (res.data.success) setAllBodyTypes(res.data.data);
      })
      .catch((err) => console.error(err));
  }, []);

  // ✅ useEffect واحد لإغلاق الكل مع أنيميشن
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        isOpen
      )
        setBrandAnimation("hide");
      if (
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(event.target) &&
        isModelOpen
      )
        setModelAnimation("hide");
      if (
        bodyTypeDropdownRef.current &&
        !bodyTypeDropdownRef.current.contains(event.target) &&
        isBodyTypeOpen
      )
        setBodyTypeAnimation("hide");
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isModelOpen, isBodyTypeOpen]);

  const downloadQRImage = () => {
    const canvas = document.querySelector(".QRCode canvas");
    if (!canvas) return;
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `QR-${CarData.brand || "Car"}-${CarData.model}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="BoxEditCar">
      <div className="TitleBoxEditCar">
        <h3>تعديل السيارة</h3>
      </div>
      <form dir="rtl" onSubmit={handleSubmit}>
        <div className="BoxFormEditCar">
          <div className="imageAndinfoCar">
            <div className="imageCar">
              <h3>
                صور السيارة:
                {uploading && (
                  <span style={{ fontSize: "12px", color: "orange" }}>
                    جاري الرفع...
                  </span>
                )}
              </h3>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleReplaceImage}
              />
              <input
                type="file"
                ref={addNewImageRef}
                style={{ display: "none" }}
                onChange={handleAddNewImage}
              />
              <div className="BoximagesCar">
                <div className="BoxImagesSlider">
                  <div
                    className="imagMain"
                    style={{
                      backgroundImage: `url(${activeImg || CarData.images[0]})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      position: "relative"
                    }}
                  >
                    <div className="imagMainOverlay">
                      <IoIosAddCircleOutline
                        className="AddImage"
                        onClick={() => addNewImageRef.current.click()}
                        style={{ cursor: "pointer" }}
                        title="إضافة صورة جديدة"
                      />
                      <AiFillDelete
                        className="DeleteImage"
                        onClick={handleDeleteActiveImage}
                        style={{ cursor: "pointer" }}
                      />
                      <FiEdit2
                        className="EditImage"
                        onClick={() => fileInputRef.current.click()}
                        style={{ cursor: "pointer" }}
                      />
                    </div>
                  </div>
                  <div className="imagSecander">
                    {CarData.images.map((img, index) => (
                      <div
                        className={`thumbnail-img ${activeImg === img ? "active" : ""}`}
                        key={index}
                        onClick={() => setActiveImg(img)}
                        style={{
                          backgroundImage: `url(${img})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center"
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="infoCar">
              <h3>معلومات السيارة:</h3>
              <div className="BoxInputinfoCar">
                <h6>الشركة المصنعة:</h6>
                <div className="custom-dropdown" ref={dropdownRef}>
                  <div
                    className={`dropdown-header ${isOpen ? "active" : ""}`}
                    onClick={() => {
                      if (isOpen) {
                        setBrandAnimation("hide");
                      } else {
                        setBrandAnimation("show");
                        setIsOpen(true);
                      }
                    }}
                  >
                    <span>{CarData.brand || "اختر الماركة..."}</span>
                    <MdKeyboardArrowDown
                      className={`arrow ${isOpen ? "open" : ""}`}
                    />
                  </div>
                  {isOpen && (
                    <ul
                      className={`dropdown-list ${brandAnimation === "hide" ? "dropdown-closing" : ""}`}
                      onAnimationEnd={() => {
                        if (brandAnimation === "hide") {
                          setIsOpen(false);
                          setBrandAnimation("show");
                        }
                      }}
                    >
                      {allBrands.map((brand) => (
                        <li
                          key={brand._id}
                          className={`dropdown-item ${CarData.brand === brand.name ? "selected" : ""}`}
                          onClick={() => {
                            setCarData({ ...CarData, brand: brand.name });
                            setBrandAnimation("hide");
                          }}
                        >
                          <span className="brand-name">{brand.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <h6>الموديل:</h6>
                <div className="custom-dropdown" ref={modelDropdownRef}>
                  <div
                    className={`dropdown-header ${isModelOpen ? "active" : ""}`}
                    onClick={() => {
                      if (isModelOpen) {
                        setModelAnimation("hide");
                      } else {
                        setModelAnimation("show");
                        setIsModelOpen(true);
                      }
                    }}
                  >
                    <span>{CarData.model || "اختر الموديل..."}</span>
                    <MdKeyboardArrowDown
                      className={`arrow ${isModelOpen ? "open" : ""}`}
                    />
                  </div>
                  {isModelOpen && (
                    <ul
                      className={`dropdown-list ${modelAnimation === "hide" ? "dropdown-closing" : ""}`}
                      onAnimationEnd={() => {
                        if (modelAnimation === "hide") {
                          setIsModelOpen(false);
                          setModelAnimation("show");
                        }
                      }}
                    >
                      {allModels.map((modelName, index) => (
                        <li
                          key={index}
                          className={`dropdown-item ${CarData.model === modelName ? "selected" : ""}`}
                          onClick={() => {
                            setCarData({ ...CarData, model: modelName });
                            setModelAnimation("hide");
                          }}
                        >
                          <span className="brand-name">{modelName}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <h6>نوع الهيكل:</h6>
                <div className="custom-dropdown" ref={bodyTypeDropdownRef}>
                  <div
                    className={`dropdown-header ${isBodyTypeOpen ? "active" : ""}`}
                    onClick={() => {
                      if (isBodyTypeOpen) {
                        setBodyTypeAnimation("hide");
                      } else {
                        setBodyTypeAnimation("show");
                        setIsBodyTypeOpen(true);
                      }
                    }}
                  >
                    <span>{CarData.bodyType || "اختر نوع الهيكل..."}</span>
                    <MdKeyboardArrowDown
                      className={`arrow ${isBodyTypeOpen ? "open" : ""}`}
                    />
                  </div>
                  {isBodyTypeOpen && (
                    <ul
                      className={`dropdown-list ${bodyTypeAnimation === "hide" ? "dropdown-closing" : ""}`}
                      onAnimationEnd={() => {
                        if (bodyTypeAnimation === "hide") {
                          setIsBodyTypeOpen(false);
                          setBodyTypeAnimation("show");
                        }
                      }}
                    >
                      {allBodyTypes.map((type) => (
                        <li
                          key={type._id}
                          className={`dropdown-item ${CarData.bodyType === type.name ? "selected" : ""}`}
                          onClick={() => {
                            setCarData({ ...CarData, bodyType: type.name });
                            setBodyTypeAnimation("hide");
                          }}
                        >
                          <span className="brand-name">{type.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <h6>سنة الصنع:</h6>
                <input
                  type="text"
                  name="year"
                  value={CarData.year}
                  onChange={handleChange}
                  placeholder="سنة الصنع"
                />
                <h6>سعر السيارة:</h6>
                <input
                  type="text"
                  name="price"
                  value={CarData.price}
                  onChange={handleChange}
                  placeholder="سعر السيارة"
                />
                <h6>لون السيارة:</h6>
                <input
                  type="text"
                  name="color"
                  value={CarData.color}
                  onChange={handleChange}
                  placeholder="لون السيارة"
                />
                <h6>عداد السيارة:</h6>
                <input
                  type="text"
                  name="mileage.value"
                  value={CarData.mileage.value}
                  onChange={handleChange}
                  placeholder="عداد السيارة"
                />
                <div className="Box-radio">
                  <input
                    type="radio"
                    name="mileage.unit"
                    value="km"
                    checked={CarData.mileage.unit === "km"}
                    onChange={handleChange}
                  />
                  <label>Km</label>
                  <input
                    type="radio"
                    name="mileage.unit"
                    value="mi"
                    checked={CarData.mileage.unit === "mi"}
                    onChange={handleChange}
                  />
                  <label>Miles</label>
                </div>
              </div>
            </div>
          </div>

          <div className="infoEngineAndFeaturesCars">
            <div className="infoEnginCar">
              <h3>معلومات المحرك:</h3>
              <div className="BoxInputinfoCar">
                <h6>عدد اسطوانات المحرك:</h6>
                <input
                  name="engine.cylinders"
                  value={CarData.engine.cylinders}
                  onChange={handleChange}
                  placeholder="عدد اسطوانات المحرك"
                />
                <h6>احصنة المحرك:</h6>
                <input
                  name="engine.horsepower"
                  value={CarData.engine.horsepower}
                  onChange={handleChange}
                  placeholder="عدد الاحصنة"
                />
                <h6>سعة المحرك باللتر:</h6>
                <input
                  name="engine.capacityLitre"
                  type="text"
                  inputMode="numeric"
                  value={CarData.engine.capacityLitre}
                  onChange={handleChange}
                  placeholder="سعة المحرك باللتر"
                />
                <h6>سعة المحرك بال CC :</h6>
                <input
                  name="engine.capacityCC"
                  type="text"
                  inputMode="numeric"
                  value={CarData.engine.capacityCC}
                  onChange={handleChange}
                  placeholder="سعة المحرك باللتر"
                />
                <h5>ناقل الحركة:</h5>
                <div className="box-radio">
                  <input
                    type="radio"
                    name="engine.transmission"
                    value="automatic"
                    checked={CarData.engine.transmission === "automatic"}
                    onChange={handleChange}
                  />
                  <label>اوتوماتيك</label>
                  <input
                    type="radio"
                    name="engine.transmission"
                    value="normal"
                    checked={CarData.engine.transmission === "normal"}
                    onChange={handleChange}
                  />
                  <label>جير عادي</label>
                </div>
                <h5>نوع الوقود:</h5>
                <div className="box-radio">
                  <input
                    type="radio"
                    name="engine.fulType"
                    value="gasoline"
                    checked={CarData.engine.fulType === "gasoline"}
                    onChange={handleChange}
                  />
                  <label>بانزين</label>
                  <input
                    type="radio"
                    name="engine.fulType"
                    value="diesel"
                    checked={CarData.engine.fulType === "diesel"}
                    onChange={handleChange}
                  />
                  <label> ديزل</label>
                  <input
                    type="radio"
                    name="engine.fulType"
                    value="electricity"
                    checked={CarData.engine.fulType === "electricity"}
                    onChange={handleChange}
                  />
                  <label>كهرباء</label>
                  <input
                    type="radio"
                    name="engine.fulType"
                    value="Hybrid"
                    checked={CarData.engine.fulType === "Hybrid"}
                    onChange={handleChange}
                  />
                  <label>هايبرد</label>
                </div>
              </div>
            </div>
            <div className="FeaturesCars">
              <h3>ميزات السيارة:</h3>
              <div className="BoxFeaturesCars">
                <div className="BoxsafetyFeatures">
                  <h4>ميزات الأمان:</h4>
                  {CarData.safetyFeatures.map((feature, index) => (
                    <div key={index} style={{ cursor: "pointer" }}>
                      {renderFeatureItem("safetyFeatures", index, feature)}
                    </div>
                  ))}
                  {renderAddInput("safetyFeatures")}
                </div>
                <div className="BoxcomfortFeatures">
                  <h4>ميزات الراحة:</h4>
                  {CarData.comfortFeatures.map((feature, index) => (
                    <div key={index} style={{ cursor: "pointer" }}>
                      {renderFeatureItem("comfortFeatures", index, feature)}
                    </div>
                  ))}
                  {renderAddInput("comfortFeatures")}
                </div>
                <div className="BoxtechFeatures">
                  <h4>ميزات التكنولوجيا:</h4>
                  {CarData.techFeatures.map((feature, index) => (
                    <div key={index} style={{ cursor: "pointer" }}>
                      {renderFeatureItem("techFeatures", index, feature)}
                    </div>
                  ))}
                  {renderAddInput("techFeatures")}
                </div>
              </div>
            </div>
          </div>

          <div className="StatusCar">
            <h3>حالة السيارة:</h3>
            <input
              type="radio"
              name="status"
              value="available"
              checked={CarData.status === "available"}
              onChange={handleChange}
            />
            <label>متوفرة</label>
            <input
              type="radio"
              name="status"
              value="sold"
              checked={CarData.status === "sold"}
              onChange={handleChange}
            />
            <label>غير متوفرة</label>
          </div>

          <div className="discCarAndQrCode">
            <div className="disCar">
              <h3>وصف السيارة:</h3>
              <textarea
                name="description"
                value={CarData.description}
                onChange={handleChange}
                rows="10"
                placeholder="اكتب وصفاً للسيارة..."
              ></textarea>
            </div>
            <div className="BoxQRCode">
              <h3>QRCode السيارة:</h3>
              <div
                className="QRCode"
                onClick={downloadQRImage}
                title="اضغط لتحميل الباركود كصورة"
              >
                <QRCodeCanvas value={CarData.qrCode} size={180} />
              </div>
            </div>
          </div>

          <div className="box-button-submit">
            <button type="button" className="btn-delete" onClick={handleDelete}>
              حذف السيارة
            </button>
            <button type="submit" className="btnSave" disabled={uploading}>
              {uploading ? "جاري الحفظ..." : "حفظ جميع التعديلات"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
