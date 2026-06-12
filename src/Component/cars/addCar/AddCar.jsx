import "./AddCar.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosArrowDown } from "react-icons/io";
import { FaSpinner } from "react-icons/fa";

import axios from "axios";
import { showSuccess, showError } from "../../toast/Toast";

const API_URL = "https://car-showroom-server.onrender.com";

const initialState = {
  brand: "",
  model: "",
  bodyType: "",
  year: "",
  price: "",
  color: "",
  images: [],
  mileage: { value: "", unit: "km" },
  engine: {
    cylinders: "",
    horsepower: "",
    capacityLitre: "",
    capacityCC: "",
    transmission: "automatic",
    fulType: "gasoline"
  },
  safetyFeatures: [],
  comfortFeatures: [],
  techFeatures: [],
  description: ""
};

export default function AddCar() {
  const navigate = useNavigate();

  const [carData, setCarData] = useState(initialState);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showBrandList, setShowBrandList] = useState(false);
  const [brandAnimation, setBrandAnimation] = useState("show");
  const [selectedBrandName, setSelectedBrandName] = useState("");
  const [classBrand, setclassBrand] = useState([]);

  const [showModelList, setShowModelList] = useState(false);
  const [modelAnimation, setModelAnimation] = useState("show");
  const [selectedModelName, setSelectedModelName] = useState("");
  const [classmodel, setclassmodel] = useState([]);

  const [showBodyTypeList, setShowBodyTypeList] = useState(false);
  const [bodyTypeAnimation, setBodyTypeAnimation] = useState("show");
  const [selectedBodyTypeName, setSelectedBodyTypeName] = useState("");
  const [classBodyType, setclassBodyType] = useState([]);

  const [featureInput, setFeatureInput] = useState({
    safety: "",
    comfort: "",
    tech: ""
  });
  const [editingIndex, setEditingIndex] = useState({
    category: null,
    index: null
  });
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/brands-with-count`)
      .then((res) => setclassBrand(res.data.data))
      .catch((err) => console.log("Error:", err));
    axios
      .get(`${API_URL}/api/unique-models`)
      .then((res) => setclassmodel(res.data.data))
      .catch((err) => console.log("Error:", err));
    axios
      .get(`${API_URL}/api/body-types`)
      .then((res) => setclassBodyType(res.data.data))
      .catch((err) => console.log("Error:", err));
  }, []);

  // ✅ إغلاق القوائم مع أنيميشن عند النقر خارجها
  useEffect(() => {
    const handleCloseAllDropdowns = () => {
      if (showBrandList) setBrandAnimation("hide");
      if (showModelList) setModelAnimation("hide");
      if (showBodyTypeList) setBodyTypeAnimation("hide");
    };
    window.addEventListener("click", handleCloseAllDropdowns);
    return () => window.removeEventListener("click", handleCloseAllDropdowns);
  }, [showBrandList, showModelList, showBodyTypeList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = [
      "year",
      "price",
      "value",
      "cylinders",
      "horsepower",
      "capacityLitre",
      "capacityCC"
    ];
    let finalValue = value;
    const fieldName = name.includes(".") ? name.split(".")[1] : name;
    if (numericFields.includes(fieldName)) {
      let cleanedValue = value.replace(/[^0-9.]/g, "");
      if ((cleanedValue.match(/\./g) || []).length > 1)
        cleanedValue = cleanedValue.replace(/\.+$/, "");
      finalValue = cleanedValue;
    }
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setCarData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: finalValue }
      }));
    } else {
      setCarData((prev) => ({ ...prev, [name]: finalValue }));
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "ml_default");
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dn0wvuirg/image/upload",
        { method: "POST", body: formData }
      );
      const data = await response.json();
      return data.secure_url;
    });
    try {
      const urls = await Promise.all(uploadPromises);
      setCarData((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
      showSuccess("تم رفع الصور بنجاح");
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      showError("فشل رفع الصور");
    } finally {
      setUploading(false);
    }
  };

  const handleSelectBrand = (brandName) => {
    setSelectedBrandName(brandName);
    setBrandAnimation("hide");
    handleChange({ target: { name: "brand", value: brandName } });
  };

  const handleSelectModel = (modelName) => {
    setSelectedModelName(modelName);
    setModelAnimation("hide");
    handleChange({ target: { name: "model", value: modelName } });
  };

  const handleSelectBodyType = (bodyTypeName) => {
    setSelectedBodyTypeName(bodyTypeName);
    setBodyTypeAnimation("hide");
    handleChange({ target: { name: "bodyType", value: bodyTypeName } });
  };

  const validateForm = () => {
    const requiredFields = [
      { key: "brand", label: "الماركة" },
      { key: "model", label: "الموديل" },
      { key: "bodyType", label: "شكل الهيكل" },
      { key: "year", label: "سنة الصنع" },
      { key: "price", label: "سعر السيارة" },
      { key: "color", label: "لون السيارة" },
      { key: "mileage.value", label: "عداد السيارة" },
      { key: "images", label: "صور السيارة", isArray: true }
    ];
    const emptyFields = [];
    requiredFields.forEach((field) => {
      if (field.isArray) {
        if (carData[field.key].length === 0) emptyFields.push(field.label);
      } else if (field.key.includes(".")) {
        const [p, c] = field.key.split(".");
        if (!carData[p]?.[c]) emptyFields.push(field.label);
      } else {
        if (!carData[field.key]) emptyFields.push(field.label);
      }
    });
    return emptyFields;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emptyFields = validateForm();
    if (emptyFields.length > 0) {
      showError("الرجاء تعبئة جميع الحقول", "حقول فارغة");
      return;
    }

    setSubmitting(true);

    // 👇 أضف هذا السطر لضمان القيم الافتراضية
    const dataToSubmit = {
      ...carData,
      engine: {
        ...carData.engine,
        transmission: carData.engine.transmission || "automatic",
        fulType: carData.engine.fulType || "gasoline"
      }
    };

    try {
      const response = await fetch(`${API_URL}/api/add/cars`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSubmit) // 👈 استخدم dataToSubmit بدل carData
      });
      if (response.ok) {
        showSuccess("تمت إضافة السيارة بنجاح");
        setTimeout(() => {
          setCarData(initialState);
          setSelectedBrandName("");
          setSelectedModelName("");
          setSelectedBodyTypeName("");
          navigate("/Dashbord/allCar");
        }, 1500);
      } else {
        showError("فشل في إضافة السيارة");
      }
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      showError("لم يتم اضافة السيارة");
    } finally {
      setSubmitting(false);
    }
  };
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   const emptyFields = validateForm();
  //   if (emptyFields.length > 0) {
  //     showError("الرجاء تعبئة جميع الحقول", "حقول فارغة");
  //     return;
  //   }

  //   setSubmitting(true);

  //   try {
  //     const response = await fetch(`${API_URL}/api/add/cars`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(carData)
  //     });
  //     if (response.ok) {
  //       showSuccess("تمت إضافة السيارة بنجاح");
  //       setTimeout(() => {
  //         setCarData(initialState);
  //         setSelectedBrandName("");
  //         setSelectedModelName("");
  //         setSelectedBodyTypeName("");
  //         navigate("/Dashbord/allCar");
  //       }, 1500);
  //     } else {
  //       showError("فشل في إضافة السيارة");
  //     }
  //   // eslint-disable-next-line no-unused-vars
  //   } catch (error) {
  //     showError("لم يتم اضافة السيارة");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  const handleAddFeature = (category, fieldName) => {
    const value = featureInput[category].trim();
    if (!value) return;
    setCarData((prev) => ({
      ...prev,
      [fieldName]: [...prev[fieldName], value]
    }));
    setFeatureInput((prev) => ({ ...prev, [category]: "" }));
  };

  const handleDeleteFeature = (fieldName, index) => {
    setCarData((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  };

  const startEdit = (category, index, currentValue) => {
    setEditingIndex({ category, index });
    setEditValue(currentValue);
  };

  const saveEdit = (fieldName) => {
    if (!editValue.trim()) return;
    setCarData((prev) => {
      const updatedList = [...prev[fieldName]];
      updatedList[editingIndex.index] = editValue.trim();
      return { ...prev, [fieldName]: updatedList };
    });
    setEditingIndex({ category: null, index: null });
    setEditValue("");
  };

  return (
    <div className="BoxAddCar">
      <div className="TitelBage">
        <h3>اضافة سيارة جديدة</h3>
        <form dir="rtl" onSubmit={handleSubmit}>
          <div className="ImagesUploadSection">
            <h4>صور السيارة:</h4>
            <div className="upload-container">
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                style={{ display: "none" }}
              />
              <label
                htmlFor="file-upload"
                className={`custom-file-upload ${uploading ? "disabled" : ""}`}
              >
                {uploading ? (
                  <>
                    <i className="fa fa-spinner fa-spin"></i> جاري الرفع...
                  </>
                ) : (
                  <>
                    <i className="fa fa-cloud-upload"></i> اختر صور السيارة
                  </>
                )}
              </label>
            </div>
            <div className="images-preview">
              {carData.images.map((url, index) => (
                <div key={index} className="image-item">
                  <img src={url} alt="car" />
                  <button
                    type="button"
                    onClick={() =>
                      setCarData((prev) => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== index)
                      }))
                    }
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="infoCarAndinfoEngine">
            <div className="infoCar">
              <h4>معلومات السيارة</h4>
              <div className="BoxInputinfoCar">
                {/* Brand */}
                <div className="BoxPBrand">
                  <p
                    onClick={(e) => {
                      e.stopPropagation();
                      if (showBrandList) {
                        setBrandAnimation("hide");
                      } else {
                        setBrandAnimation("show");
                        setShowBrandList(true);
                      }
                      setShowModelList(false);
                      setShowBodyTypeList(false);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    اختر الماركة{" "}
                    <IoIosArrowDown
                      className={showBrandList ? "rotate-icon" : ""}
                    />
                  </p>
                  <p>{selectedBrandName}</p>
                </div>
                {showBrandList && (
                  <ul
                    className={`custom-dropdown-list ${brandAnimation === "hide" ? "dropdown-closing" : ""}`}
                    onClick={(e) => e.stopPropagation()}
                    onAnimationEnd={() => {
                      if (brandAnimation === "hide") {
                        setShowBrandList(false);
                        setBrandAnimation("show");
                      }
                    }}
                  >
                    {classBrand.map((brand, index) => (
                      <li
                        key={index}
                        onClick={() => handleSelectBrand(brand.name)}
                      >
                        {brand.name}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Model */}
                <div className="BoxPModel">
                  <p
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowBrandList(false);
                      setShowBodyTypeList(false);
                      if (showModelList) {
                        setModelAnimation("hide");
                      } else {
                        setModelAnimation("show");
                        setShowModelList(true);
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    اختر الموديل{" "}
                    <IoIosArrowDown
                      className={showModelList ? "rotate-icon" : ""}
                    />
                  </p>
                  <p>{selectedModelName}</p>
                </div>
                {showModelList && (
                  <ul
                    className={`custom-dropdown-list-Model ${modelAnimation === "hide" ? "dropdown-closing" : ""}`}
                    onClick={(e) => e.stopPropagation()}
                    onAnimationEnd={() => {
                      if (modelAnimation === "hide") {
                        setShowModelList(false);
                        setModelAnimation("show");
                      }
                    }}
                  >
                    {classmodel.map((modelName, index) => (
                      <li
                        key={index}
                        onClick={() => handleSelectModel(modelName)}
                      >
                        {modelName}
                      </li>
                    ))}
                  </ul>
                )}

                {/* BodyType */}
                <div className="BoxPBodyType">
                  <p
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowBrandList(false);
                      setShowModelList(false);
                      if (showBodyTypeList) {
                        setBodyTypeAnimation("hide");
                      } else {
                        setBodyTypeAnimation("show");
                        setShowBodyTypeList(true);
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    اختر شكل الهيكل{" "}
                    <IoIosArrowDown
                      className={showBodyTypeList ? "rotate-icon" : ""}
                    />
                  </p>
                  <p>{selectedBodyTypeName}</p>
                </div>
                {showBodyTypeList && (
                  <ul
                    className={`custom-dropdown-list-BodyType ${bodyTypeAnimation === "hide" ? "dropdown-closing" : ""}`}
                    onClick={(e) => e.stopPropagation()}
                    onAnimationEnd={() => {
                      if (bodyTypeAnimation === "hide") {
                        setShowBodyTypeList(false);
                        setBodyTypeAnimation("show");
                      }
                    }}
                  >
                    {classBodyType.map((bodyTypeName, index) => (
                      <li
                        key={index}
                        onClick={() => handleSelectBodyType(bodyTypeName.name)}
                      >
                        {bodyTypeName.name}
                      </li>
                    ))}
                  </ul>
                )}

                <input
                  name="year"
                  type="text"
                  inputMode="numeric"
                  value={carData.year || ""}
                  onChange={handleChange}
                  placeholder="سنة الصنع"
                />
                <input
                  name="price"
                  type="text"
                  inputMode="numeric"
                  value={carData.price || ""}
                  onChange={handleChange}
                  placeholder="سعر السيارة"
                />
                <input
                  name="color"
                  type="text"
                  value={carData.color || ""}
                  onChange={handleChange}
                  placeholder="لون السيارة"
                />
                <input
                  name="mileage.value"
                  type="text"
                  inputMode="numeric"
                  value={carData.mileage.value || ""}
                  onChange={handleChange}
                  placeholder="عداد السيارة"
                />
                <div className="Box-radio">
                  <input
                    type="radio"
                    name="mileage.unit"
                    value="mi"
                    checked={carData.mileage.unit === "mi"}
                    onChange={handleChange}
                  />
                  <label>Miles</label>
                  <input
                    type="radio"
                    name="mileage.unit"
                    value="km"
                    checked={carData.mileage.unit === "km"}
                    onChange={handleChange}
                  />
                  <label>Km</label>
                </div>
              </div>
            </div>

            <div className="infoEngine">
              <h4>معلومات المحرك</h4>
              <div className="BoxInputinfoEngine">
                <input
                  name="engine.cylinders"
                  type="text"
                  inputMode="numeric"
                  value={carData.engine.cylinders || ""}
                  onChange={handleChange}
                  placeholder="عدد اسطوانات المحرك"
                />
                <input
                  name="engine.horsepower"
                  type="text"
                  inputMode="numeric"
                  value={carData.engine.horsepower || ""}
                  onChange={handleChange}
                  placeholder="عدد الاحصنة"
                />
                <input
                  name="engine.capacityLitre"
                  type="text"
                  inputMode="numeric"
                  value={carData.engine.capacityLitre || ""}
                  onChange={handleChange}
                  placeholder="سعة المحرك باللتر"
                />
                <input
                  name="engine.capacityCC"
                  type="text"
                  inputMode="numeric"
                  value={carData.engine.capacityCC || ""}
                  onChange={handleChange}
                  placeholder="سعة المحرك ب CC"
                />
                <h5>ناقل الحركة</h5>
                <div className="box-radio">
                  <label>اوتوماتيك</label>
                  <input
                    type="radio"
                    name="engine.transmission"
                    value="automatic"
                    checked={carData.engine.transmission === "automatic"}
                    onChange={handleChange}
                  />
                  <label>جير عادي</label>
                  <input
                    type="radio"
                    name="engine.transmission"
                    value="normal"
                    checked={carData.engine.transmission === "normal"}
                    onChange={handleChange}
                  />
                </div>
                <h5>نوع الوقود</h5>
                <div className="box-radio">
                  <label>بانزين</label>
                  <input
                    type="radio"
                    name="engine.fuelType"
                    value="gasoline"
                    checked={carData.engine.fulType === "gasoline"}
                    onChange={handleChange}
                  />
                  <label>ديزل</label>
                  <input
                    type="radio"
                    name="engine.fuelType"
                    value="diesel"
                    checked={carData.engine.fulType === "diesel"}
                    onChange={handleChange}
                  />
                  <label>كهرباء</label>
                  <input
                    type="radio"
                    name="engine.fuelType"
                    value="electricity"
                    checked={carData.engine.fulType === "electricity"}
                    onChange={handleChange}
                  />
                  <label>هايبرد</label>
                  <input
                    type="radio"
                    name="engine.fuelType"
                    value="Hybrid"
                    checked={carData.engine.fulType === "Hybrid"}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="FeaturesCar">
            <h4>ميزات السيارة:</h4>
            <div className="FeaturesSafetyAndComfortAndTech">
              {["safety", "comfort", "tech"].map((cat) => {
                const titles = {
                  safety: "ميزات الامان:",
                  comfort: "ميزات الراحة:",
                  tech: "ميزات التكنلوجيا :"
                };
                const fieldNames = {
                  safety: "safetyFeatures",
                  comfort: "comfortFeatures",
                  tech: "techFeatures"
                };
                return (
                  <div className={`${cat}Features`} key={cat}>
                    <h5>{titles[cat]}</h5>
                    <div
                      className={`box-${cat === "safety" ? "safetyFeatures" : cat === "comfort" ? "ComfortFeatures" : "TechFeatures"}`}
                    >
                      <div className="inputAndbutton">
                        <input
                          type="text"
                          placeholder="اضف الميزة"
                          value={featureInput[cat]}
                          onChange={(e) =>
                            setFeatureInput({
                              ...featureInput,
                              [cat]: e.target.value
                            })
                          }
                        />
                        <button
                          type="button"
                          onClick={() => handleAddFeature(cat, fieldNames[cat])}
                        >
                          اضافة
                        </button>
                      </div>
                      <ul className="features-list">
                        {carData[fieldNames[cat]].map((f, i) => (
                          <li
                            key={i}
                            style={{
                              display: "flex",
                              gap: "10px",
                              marginBottom: "5px"
                            }}
                          >
                            {editingIndex.category === cat &&
                            editingIndex.index === i ? (
                              <div className="editFeatures">
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  autoFocus
                                />
                                <div className="box-button">
                                  <button
                                    type="button"
                                    onClick={() => saveEdit(fieldNames[cat])}
                                  >
                                    حفظ
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEditingIndex({
                                        category: null,
                                        index: null
                                      })
                                    }
                                  >
                                    إلغاء
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="bottonsFeatures">
                                <span>{f}</span>
                                <div className="box-button">
                                  <button
                                    type="button"
                                    onClick={() => startEdit(cat, i, f)}
                                  >
                                    تعديل
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteFeature(fieldNames[cat], i)
                                    }
                                  >
                                    حذف
                                  </button>
                                </div>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="DescriptionCar">
            <h4>وصف السيارة:</h4>
            <div className="box-DescriptionCar">
              <textarea
                name="description"
                rows="10"
                placeholder="اكتب الوصف"
                value={carData.description || ""}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          <div className="box-button-submit">
            <button
              type="submit"
              className="box-button-submit"
              disabled={submitting}
              style={{
                marginTop: "20px",
                padding: "10px 30px",
                opacity: submitting ? 0.7 : 1,
                cursor: submitting ? "not-allowed" : "pointer"
              }}
            >
              {submitting ? (
                <div className="Loding">
                  جاري الاضافة
                  <FaSpinner className="spinner-icon" />
                </div>
              ) : (
                "اضافة السيارة"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
