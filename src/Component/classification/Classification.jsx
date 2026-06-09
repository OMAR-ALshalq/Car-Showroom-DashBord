import "./classification.css";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FaTrash,
  FaEdit,
  FaPlusCircle,
  FaTimes,
  FaCloudUploadAlt,
  FaCheckCircle
} from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { GrClose } from "react-icons/gr";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { showSuccess, showError, showConfirm } from "../toast/Toast";
import Loader from "../loader/Loader";

const API_URL = "https://car-showroom-server.onrender.com";


export default function Classification() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    bodyType: ""
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/classifications/hierarchy`
      );
      setItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching classifications:", error);
      setLoading(false);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return "";
    const data = new FormData();
    data.append("file", imageFile);
    data.append("upload_preset", "ml_default");
    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dn0wvuirg/image/upload",
        data
      );
      return res.data.secure_url;
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      return "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.brand.trim()) {
      showError("الرجاء إدخال اسم الماركة", "حقل فارغ");
      return;
    }
    if (!formData.model.trim()) {
      showError("الرجاء إدخال اسم الموديل", "حقل فارغ");
      return;
    }
    if (!formData.bodyType.trim()) {
      showError("الرجاء إدخال نوع الهيكل", "حقل فارغ");
      return;
    }
    setIsSubmitting(true);
    const imageUrl = await handleImageUpload();
    try {
      await axios.post(`${API_URL}/api/add/classifications`, {
        ...formData,
        imageUrl
      });
      setShowModal(false);
      setFormData({ brand: "", model: "", bodyType: "" });
      setImageFile(null);
      fetchData();
      showSuccess("تمت إضافة التصنيف بنجاح");
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      showError("فشل حفظ التصنيف، يرجى المحاولة مرة أخرى");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    showConfirm(
      "لن تتمكن من التراجع عن حذف هذا التصنيف!",
      "هل أنت متأكد؟",
      async () => {
        try {
          await axios.delete(
            `${API_URL}/api/classifications/delete/${id}`
          );
          setItems((prevItems) => prevItems.filter((item) => item._id !== id));
          showSuccess("تم حذف التصنيف بنجاح", "تم الحذف!");
          // eslint-disable-next-line no-unused-vars
        } catch (error) {
          showError("حدثت مشكلة أثناء عملية الحذف");
        }
      }
    );
  };

  const openEditModal = (item) => {
    setSelectedItem({
      id: item._id,
      brand: item.parentId?.parentId?.name || "",
      model: item.parentId?.name || "",
      bodyType: item.name,
      image: item.parentId?.parentId?.image || ""
    });
    setFormData({
      brand: item.parentId?.parentId?.name || "",
      model: item.parentId?.name || "",
      bodyType: item.name
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.brand.trim()) {
      showError("الرجاء إدخال اسم الماركة", "حقل فارغ");
      return;
    }
    if (!formData.model.trim()) {
      showError("الرجاء إدخال اسم الموديل", "حقل فارغ");
      return;
    }
    if (!formData.bodyType.trim()) {
      showError("الرجاء إدخال نوع الهيكل", "حقل فارغ");
      return;
    }
    setIsSubmitting(true);
    try {
      let imageUrl = selectedItem.image;
      if (imageFile) imageUrl = await handleImageUpload();
      await axios.put(
        `${API_URL}/api/edit/classifications/${selectedItem.id}`,
        { ...formData, imageUrl }
      );
      setFormData({ brand: "", model: "", bodyType: "" });
      setShowEditModal(false);
      setImageFile(null);
      fetchData();
      showSuccess("تم تحديث البيانات");
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      showError("فشل التحديث");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========== الفلترة ==========
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedBodyType, setSelectedBodyType] = useState("");

  const filteredItems = items.filter((item) => {
    const itemBrandName = item.parentId?.parentId?.name;
    const itemModelName = item.parentId?.name;
    const itemBodyName = item.name;
    const brandMatch = selectedBrand ? itemBrandName === selectedBrand : true;
    const modelMatch = selectedModel ? itemModelName === selectedModel : true;
    const bodyMatch = selectedBodyType
      ? itemBodyName === selectedBodyType
      : true;
    return brandMatch && modelMatch && bodyMatch;
  });

  const uniqueBrands = [
    ...new Set(items.map((item) => item.parentId?.parentId?.name))
  ].filter(Boolean);
  const allUniqueBodyTypes = [
    ...new Set(items.map((item) => item.name))
  ].filter(Boolean);

  const availableModels = selectedBrand
    ? [
        ...new Set(
          items
            .filter((item) => item.parentId?.parentId?.name === selectedBrand)
            .map((item) => item.parentId?.name)
        )
      ]
    : [...new Set(items.map((item) => item.parentId?.name))];

  const availableBodyTypes =
    selectedBrand || selectedModel
      ? [...new Set(filteredItems.map((item) => item.name))]
      : allUniqueBodyTypes;

  const [showBrandList, setShowBrandList] = useState(false);
  const [showModelList, setShowModelList] = useState(false);
  const [showBodyTypeList, setShowBodyTypeList] = useState(false);

  // ✅ أنيميشن
  const [brandAnimation, setBrandAnimation] = useState("show");
  const [modelAnimation, setModelAnimation] = useState("show");
  const [bodyTypeAnimation, setBodyTypeAnimation] = useState("show");

  const handleBrandSelect = (brandName) => {
    setSelectedBrand(brandName);
    setSelectedModel("");
    setSelectedBodyType("");
    setBrandAnimation("hide");
  };

  const handleModelSelect = (modelName) => {
    setSelectedModel(modelName);
    setSelectedBodyType("");
    setModelAnimation("hide");
  };

  const handleBodyTypeSelect = (typeName) => {
    setSelectedBodyType(typeName);
    setBodyTypeAnimation("hide");
  };

  const handleResetFilters = () => {
    setSelectedBrand("");
    setSelectedModel("");
    setSelectedBodyType("");
    setShowBrandList(false);
    setShowModelList(false);
    setShowBodyTypeList(false);
  };

  const brandRef = useRef(null);
  const modelRef = useRef(null);
  const bodyTypeRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        brandRef.current &&
        !brandRef.current.contains(event.target) &&
        showBrandList
      )
        setBrandAnimation("hide");
      if (
        modelRef.current &&
        !modelRef.current.contains(event.target) &&
        showModelList
      )
        setModelAnimation("hide");
      if (
        bodyTypeRef.current &&
        !bodyTypeRef.current.contains(event.target) &&
        showBodyTypeList
      )
        setBodyTypeAnimation("hide");
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showBrandList, showModelList, showBodyTypeList]);

  const [showFilter, setshowFilter] = useState(false);
  const [filterAnimation, setfilterAnimation] = useState("show");
  const openFilterSidebar = () => {
    setfilterAnimation("show");
    setshowFilter(true);
  };
  const closeFilterSidebar = () => {
    setfilterAnimation("hide");
  };

  return (
    <div className="BoxClassification" id="Headr">
      <div className="BoxMainClassification" id="headrCard">
        <div className="HeaderSection" dir="rtl">
          <h2>التصنيفات</h2>
          <div className="FilterAndAddClass">
            <button className="btnAddClass" onClick={() => setShowModal(true)}>
              <FaPlusCircle /> إضافة تصنيف جديد
            </button>
            <div className="filter">
              {/* Brand */}
              <div className="Brand-select" ref={brandRef}>
                <div
                  className="select-header"
                  onClick={() => {
                    if (showBrandList) {
                      setBrandAnimation("hide");
                    } else {
                      setBrandAnimation("show");
                      setShowBrandList(true);
                    }
                  }}
                >
                  <div>
                    <span>{selectedBrand || "الماركات"}</span>
                  </div>
                  <IoIosArrowDown
                    className={showBrandList ? "rotate-icon" : ""}
                  />
                </div>
                {showBrandList && (
                  <ul
                    className={`select-dropdown-list ${brandAnimation === "hide" ? "dropdown-closing" : ""}`}
                    onAnimationEnd={() => {
                      if (brandAnimation === "hide") {
                        setShowBrandList(false);
                        setBrandAnimation("show");
                      }
                    }}
                  >
                    <li onClick={() => handleBrandSelect("")}>كل الماركات</li>
                    {uniqueBrands.map((brandName) => (
                      <li
                        key={`brand-list-${brandName}`}
                        onClick={() => handleBrandSelect(brandName)}
                      >
                        {brandName}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* Model */}
              <div className="Model-select" ref={modelRef}>
                <div
                  className="select-header"
                  onClick={() => {
                    setShowBrandList(false);
                    setShowBodyTypeList(false);
                    if (showModelList) {
                      setModelAnimation("hide");
                    } else {
                      setModelAnimation("show");
                      setShowModelList(true);
                    }
                  }}
                >
                  <span>{selectedModel || "الموديلات"}</span>
                  <IoIosArrowDown
                    className={showModelList ? "rotate-icon" : ""}
                  />
                </div>
                {showModelList && (
                  <ul
                    className={`select-dropdown-list ${modelAnimation === "hide" ? "dropdown-closing" : ""}`}
                    onAnimationEnd={() => {
                      if (modelAnimation === "hide") {
                        setShowModelList(false);
                        setModelAnimation("show");
                      }
                    }}
                  >
                    <li onClick={() => handleModelSelect("")}>كل الموديلات</li>
                    {availableModels.length > 0 ? (
                      availableModels.map((m) => (
                        <li
                          key={`model-item-${m}`}
                          onClick={() => handleModelSelect(m)}
                        >
                          {m}
                        </li>
                      ))
                    ) : (
                      <li className="no-options">لا توجد موديلات متاحة</li>
                    )}
                  </ul>
                )}
              </div>
              {/* BodyType */}
              <div className="BodyType-select" ref={bodyTypeRef}>
                <div
                  className="select-header"
                  onClick={() => {
                    setShowBrandList(false);
                    setShowModelList(false);
                    if (showBodyTypeList) {
                      setBodyTypeAnimation("hide");
                    } else {
                      setBodyTypeAnimation("show");
                      setShowBodyTypeList(true);
                    }
                  }}
                >
                  <span>{selectedBodyType || "الهياكل"}</span>
                  <IoIosArrowDown
                    className={showBodyTypeList ? "rotate-icon" : ""}
                  />
                </div>
                {showBodyTypeList && (
                  <ul
                    className={`select-dropdown-list ${bodyTypeAnimation === "hide" ? "dropdown-closing" : ""}`}
                    onAnimationEnd={() => {
                      if (bodyTypeAnimation === "hide") {
                        setShowBodyTypeList(false);
                        setBodyTypeAnimation("show");
                      }
                    }}
                  >
                    <li onClick={() => handleBodyTypeSelect("")}>كل الهياكل</li>
                    {availableBodyTypes.length > 0 ? (
                      availableBodyTypes.map((typeName) => (
                        <li
                          key={`body-list-item-${typeName}`}
                          onClick={() => handleBodyTypeSelect(typeName)}
                        >
                          {typeName}
                        </li>
                      ))
                    ) : (
                      <li className="no-options">لا توجد خيارات متاحة</li>
                    )}
                  </ul>
                )}
              </div>
              <button className="btn-reset-filter" onClick={handleResetFilters}>
                اعادة تعين
              </button>
            </div>
            <button className="button-filter-list" onClick={openFilterSidebar}>
              filter
            </button>
          </div>
        </div>

        {!loading && (
          <div className="grid-table-classification">
            <span className="table-header">Imag</span>
            <span className="table-header">Brand</span>
            <span className="table-header">Model</span>
            <span className="table-header">Body Type</span>
            <span className="table-header">Action</span>
            {filteredItems.length > 0 ? (
              filteredItems.map((bodyType) => {
                const model = bodyType.parentId;
                const brand = model?.parentId;
                return (
                  <React.Fragment key={bodyType._id}>
                    <div className="table-cell">
                      {brand?.image && (
                        <img
                          src={brand.image}
                          alt="logo"
                          className="mini-logo-grid"
                        />
                      )}
                    </div>
                    <div className="table-cell">
                      <div className="brand-cell-content">
                        <span>{brand?.name || "N/A"}</span>
                      </div>
                    </div>
                    <div className="table-cell">{model?.name || "N/A"}</div>
                    <div className="table-cell">
                      <span className="badge-grid">{bodyType.name}</span>
                    </div>
                    <div className="table-cell">
                      <a
                        href="#Headr"
                        className="buttonEdit"
                        onClick={() => openEditModal(bodyType)}
                      >
                        تعديل
                      </a>
                      <button
                        className="buttonDelete"
                        onClick={() => handleDelete(bodyType._id)}
                      >
                        حذف
                      </button>
                    </div>
                  </React.Fragment>
                );
              })
            ) : (
              <div className="NoDataMsg" style={{ gridColumn: "span 5" }}>
                لا توجد تصنيفات متاحة حالياً..
              </div>
            )}
          </div>
        )}

        {!loading && (
          <div className="BoxCard" dir="rtl">
            {filteredItems.length > 0 ? (
              filteredItems.map((bodyType) => {
                const model = bodyType.parentId;
                const brand = model?.parentId;
                return (
                  <div className="BoxCard-classification" key={bodyType._id}>
                    <div className="Card">
                      <div className="Imag">
                        <img src={brand.image} />
                      </div>
                      <div className="BrandName">
                        <h4>الشركة:</h4>
                        <h3>{brand.name}</h3>
                      </div>
                      <div className="ModelName">
                        <h4>الموديل:</h4>
                        <h3>{model.name}</h3>
                      </div>
                      <div className="BodyType">
                        <h4>شكل الهيكل:</h4>
                        <h3>{bodyType.name}</h3>
                      </div>
                      <div className="ButtonCard">
                        <a
                          href="#headrCard"
                          className="buttonEdit"
                          onClick={() => openEditModal(bodyType)}
                        >
                          تعديل
                        </a>
                        <button
                          className="buttonDelete"
                          onClick={() => handleDelete(bodyType._id)}
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="NoDataMsg" style={{ gridColumn: "span 4" }}>
                لا توجد تصنيفات متاحة حالياً..
              </div>
            )}
          </div>
        )}

        {loading && <Loader text="جاري تحميل التصنيفات..." />}
      </div>

      {showModal && (
        <div className="ModalOverlay">
          <div className="ModalContent" dir="rtl">
            <FaTimes
              className="closeIcon"
              onClick={() => {
                setShowModal(false);
                setFormData({ brand: "", model: "", bodyType: "" });
              }}
            />
            <form onSubmit={handleSubmit} className="ModalForm">
              <div className="InputGroup">
                <label>اسم الماركة:</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                />
              </div>
              <div className="InputGroup">
                <label>اسم الموديل:</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                />
              </div>
              <div className="InputGroup">
                <label>نوع الهيكل :</label>
                <input
                  type="text"
                  value={formData.bodyType}
                  onChange={(e) =>
                    setFormData({ ...formData, bodyType: e.target.value })
                  }
                />
              </div>
              <div className="InputGroup">
                <label>صورة الماركة :</label>
                <div className="custom-file-upload">
                  <input
                    type="file"
                    id="file-upload"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    hidden
                  />
                  <label htmlFor="file-upload" className="file-label">
                    <FaCloudUploadAlt />{" "}
                    {imageFile ? imageFile.name : "اختر صورة لرفعها"}
                  </label>
                </div>
              </div>
              <div className="ModalActions">
                <button
                  type="submit"
                  className="btnSave"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "جاري الحفظ والرفع..." : "حفظ التصنيف"}
                </button>
                <button
                  type="button"
                  className="btnCancel"
                  onClick={() => setShowModal(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="ModalOverlay">
          <div className="ModalContent " dir="rtl">
            <div className="ModalHeader">
              <FaTimes
                className="closeIcon"
                onClick={() => {
                  setShowEditModal(false);
                  setFormData({ brand: "", model: "", bodyType: "" });
                }}
              />
            </div>
            <form onSubmit={handleEditSubmit} className="ModalForm">
              <div className="current-image-section">
                <label>الشعار الحالي:</label>
                {selectedItem?.image ? (
                  <img
                    src={selectedItem.image}
                    alt="Logo"
                    className="edit-preview-img"
                  />
                ) : (
                  <div className="no-image-placeholder">لا توجد صورة</div>
                )}
              </div>
              <div className="InputGroup">
                <label>الماركة</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                />
              </div>
              <div className="InputGroup">
                <label>الموديل</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                />
              </div>
              <div className="InputGroup">
                <label>نوع الهيكل</label>
                <input
                  type="text"
                  value={formData.bodyType}
                  onChange={(e) =>
                    setFormData({ ...formData, bodyType: e.target.value })
                  }
                />
              </div>
              <div className="InputGroup">
                <label>تغيير الصورة (اختياري)</label>
                <div className="custom-file-upload">
                  <input
                    type="file"
                    id="edit-file"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    hidden
                  />
                  <label htmlFor="edit-file" className="file-label">
                    <FaCloudUploadAlt />{" "}
                    {imageFile ? imageFile.name : "اختر صورة جديدة"}
                  </label>
                </div>
              </div>
              <div className="ModalActions">
                <button
                  type="submit"
                  className="btnUpdate"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "جاري التحديث..." : "حفظ التغييرات"}
                </button>
                <button
                  type="button"
                  className="btnCancel"
                  onClick={() => setShowEditModal(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFilter && (
        <div
          className={`filter-sidebar-wrapper ${filterAnimation === "show" ? "animateFilterShow" : "animateFilterHide"}`}
          dir="rtl"
          onAnimationEnd={() => {
            if (filterAnimation === "hide") setshowFilter(false);
          }}
        >
          <div className="sidebar-header">
            <GrClose className="Closeicon" onClick={closeFilterSidebar} />
          </div>
          <div className="sidebar-body">
            <div className="filter-container-vertical">
              <div className="Brand-select" ref={brandRef}>
                <div
                  className="select-header"
                  onClick={() => {
                    setBrandAnimation("show");
                    setShowBrandList(!showBrandList);
                  }}
                >
                  <MdOutlineKeyboardArrowRight className="IconRight" />
                  <span>{selectedBrand || "الماركات"}</span>
                </div>
                {showBrandList && (
                  <ul
                    className={`select-dropdown-list ${brandAnimation === "hide" ? "dropdown-closing" : ""}`}
                    onAnimationEnd={() => {
                      if (brandAnimation === "hide") {
                        setShowBrandList(false);
                        setBrandAnimation("show");
                      }
                    }}
                  >
                    <li onClick={() => handleBrandSelect("")}>كل الماركات</li>
                    {uniqueBrands.map((brandName) => (
                      <li
                        key={`brand-list-${brandName}`}
                        onClick={() => handleBrandSelect(brandName)}
                      >
                        {brandName}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="Model-select" ref={modelRef}>
                <div
                  className="select-header"
                  onClick={() => {
                    setModelAnimation("show");
                    setShowModelList(!showModelList);
                    setShowBrandList(false);
                    setShowBodyTypeList(false);
                  }}
                >
                  <MdOutlineKeyboardArrowRight className="IconRight" />
                  <span>{selectedModel || "الموديلات"}</span>
                </div>
                {showModelList && (
                  <ul
                    className={`select-dropdown-list ${modelAnimation === "hide" ? "dropdown-closing" : ""}`}
                    onAnimationEnd={() => {
                      if (modelAnimation === "hide") {
                        setShowModelList(false);
                        setModelAnimation("show");
                      }
                    }}
                  >
                    <li onClick={() => handleModelSelect("")}>كل الموديلات</li>
                    {availableModels.length > 0 ? (
                      availableModels.map((m) => (
                        <li
                          key={`model-item-${m}`}
                          onClick={() => handleModelSelect(m)}
                        >
                          {m}
                        </li>
                      ))
                    ) : (
                      <li className="no-options">لا توجد موديلات متاحة</li>
                    )}
                  </ul>
                )}
              </div>
              <div className="BodyType-select" ref={bodyTypeRef}>
                <div
                  className="select-header"
                  onClick={() => {
                    setBodyTypeAnimation("show");
                    setShowBodyTypeList(!showBodyTypeList);
                    setShowBrandList(false);
                    setShowModelList(false);
                  }}
                >
                  <MdOutlineKeyboardArrowRight className="IconRight" />
                  <span>{selectedBodyType || "الهياكل"}</span>
                </div>
                {showBodyTypeList && (
                  <ul
                    className={`select-dropdown-list ${bodyTypeAnimation === "hide" ? "dropdown-closing" : ""}`}
                    onAnimationEnd={() => {
                      if (bodyTypeAnimation === "hide") {
                        setShowBodyTypeList(false);
                        setBodyTypeAnimation("show");
                      }
                    }}
                  >
                    <li onClick={() => handleBodyTypeSelect("")}>كل الهياكل</li>
                    {availableBodyTypes.length > 0 ? (
                      availableBodyTypes.map((typeName) => (
                        <li
                          key={`body-list-item-${typeName}`}
                          onClick={() => handleBodyTypeSelect(typeName)}
                        >
                          {typeName}
                        </li>
                      ))
                    ) : (
                      <li className="no-options">لا توجد خيارات متاحة</li>
                    )}
                  </ul>
                )}
              </div>
              <button className="btn-reset-filter" onClick={handleResetFilters}>
                اعادة تعين
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
