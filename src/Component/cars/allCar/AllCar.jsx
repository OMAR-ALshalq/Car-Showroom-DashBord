import "./AllCar.css";
import CarPdfDocument from "../CarPdfDocument"
import { AiFillDollarCircle } from "react-icons/ai";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { FaAngleUp } from "react-icons/fa6";
import { FiSearch } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";

const API_URL = "https://car-showroom-server.onrender.com";


export default function AllCar() {
  const [activeFeatures, setActiveFeatures] = useState(null);
  const [closingFeatures, setClosingFeatures] = useState(null); // ✅ جديد

  useEffect(() => {
    const closeDropdown = () => {
      if (activeFeatures) {
        // ✅ تشغيل أنيميشن الإغلاق
        setClosingFeatures(activeFeatures);
        setTimeout(() => {
          setActiveFeatures(null);
          setClosingFeatures(null);
        }, 150);
      }
    };
    window.addEventListener("click", closeDropdown);
    return () => window.removeEventListener("click", closeDropdown);
  }, [activeFeatures]);

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/cars`);
        const data = await response.json();
        setCars(data);
      } catch (error) {
        console.error("خطأ في جلب السيارات:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  // ✅ دالة handleToggle مع أنيميشن الإغلاق
  const handleToggle = (featuresList) => {
    if (activeFeatures === featuresList) {
      setClosingFeatures(featuresList);
      setTimeout(() => {
        setActiveFeatures(null);
        setClosingFeatures(null);
      }, 150);
    } else {
      setActiveFeatures(featuresList);
    }
  };

  const CarSkeleton = () => (
    <div className="CardCar skeleton-card">
      <div className="infoCar">
        <div className="CarimagAndinfo">
          <div className="CarImage">
            <div className="shimmer sk-image"></div>
          </div>
          <div className="Carinfo">
            <div className="shimmer sk-title"></div>
            <div className="shimmer sk-line"></div>
            <div className="shimmer sk-line"></div>
            <div className="shimmer sk-line"></div>
          </div>
        </div>
        <div className="CarStatus">
          <div className="shimmer sk-status"></div>
        </div>
        <div className="CarPriceAndEdite">
          <div className="box-QrCodeCar">
            <div className="shimmer sk-qr"></div>
          </div>
          <div className="PraiceAndEditeCar">
            <div className="shimmer sk-title" style={{ width: "60px" }}></div>
            <div className="shimmer sk-button"></div>
          </div>
        </div>
      </div>
      <hr />
      <div className="BoxCarDetils">
        <div className="BoxFeatures">
          <div className="shimmer sk-feature"></div>
          <div className="shimmer sk-feature"></div>
          <div className="shimmer sk-feature"></div>
        </div>
        <div
          className="shimmer sk-button"
          style={{ width: "150px", marginTop: "10px" }}
        ></div>
      </div>
    </div>
  );

  const brands = [...new Set(cars.map((car) => car.brand))];
  const models = selectedBrand
    ? [
        ...new Set(
          cars
            .filter((car) => car.brand === selectedBrand)
            .map((car) => car.model)
        )
      ]
    : [];

  const filteredCars = cars.filter((car) => {
    const matchSearch = (car.brand + " " + car.model)
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchBrand = selectedBrand === "" || car.brand === selectedBrand;
    const matchModel = selectedModel === "" || car.model === selectedModel;
    const matchPrice = maxPrice === "" || car.price <= parseFloat(maxPrice);
    return matchSearch && matchBrand && matchModel && matchPrice;
  });

  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [dropdownAnimation, setDropdownAnimation] = useState("show");

  const openDropdown = () => {
    setDropdownAnimation("show");
    setShowBrandDropdown(true);
  };
  const closeDropdown = () => {
    setDropdownAnimation("hide");
  };

  const handleBrandSelect = (brandName) => {
    setSelectedBrand(brandName);
    setSelectedModel("");
    closeDropdown();
  };

  useEffect(() => {
    const handleOutsideClick = () => {
      if (showBrandDropdown) closeDropdown();
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [showBrandDropdown]);

  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [modelAnimation, setModelAnimation] = useState("show");

  const openModelDropdown = () => {
    if (!selectedBrand) return;
    setModelAnimation("show");
    setShowModelDropdown(true);
  };
  const closeModelDropdown = () => {
    setModelAnimation("hide");
  };

  const handleModelSelect = (modelName) => {
    setSelectedModel(modelName);
    closeModelDropdown();
  };

  useEffect(() => {
    const handleOutsideModelClick = () => {
      if (showModelDropdown) closeModelDropdown();
    };
    window.addEventListener("click", handleOutsideModelClick);
    return () => window.removeEventListener("click", handleOutsideModelClick);
  }, [showModelDropdown]);

  return (
    <div className="BoxAllCar">
      <div className="filterAndAddCar" id="AllCar" dir="rtl">
        <Link to="/Dashbord/allcar/addCar">اضافة سيارة</Link>
        <div className="filter-container" dir="rtl">
          <div className="BoxSearch">
            <FiSearch className="icon-Search" />
            <input
              type="text"
              placeholder="ابحث عن سيارة (ماركة أو موديل)..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="select-group">
            <div className="Select-Brand" onClick={(e) => e.stopPropagation()}>
              <div
                className={`dropdown-header ${showBrandDropdown ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  showBrandDropdown ? closeDropdown() : openDropdown();
                }}
              >
                <span>{selectedBrand || "كل الشركات"}</span>
                <IoIosArrowDown
                  className={`arrow-icon ${showBrandDropdown ? "rotate-icon" : ""}`}
                />
              </div>
              {showBrandDropdown && (
                <ul
                  className={`dropdown-list-items ${dropdownAnimation === "show" ? "" : "dropdown-closing"}`}
                  onAnimationEnd={() => {
                    if (dropdownAnimation === "hide")
                      setShowBrandDropdown(false);
                  }}
                >
                  <li
                    className={selectedBrand === "" ? "selected" : ""}
                    onClick={() => handleBrandSelect("")}
                  >
                    كل الشركات
                  </li>
                  {brands.map((brand) => (
                    <li
                      key={`custom-brand-${brand}`}
                      className={selectedBrand === brand ? "selected" : ""}
                      onClick={() => handleBrandSelect(brand)}
                    >
                      {brand}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="Select-Model" onClick={(e) => e.stopPropagation()}>
              <div
                className={`dropdown-header ${showModelDropdown ? "active" : ""} ${!selectedBrand ? "disabled-style" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!selectedBrand) return;
                  showModelDropdown
                    ? closeModelDropdown()
                    : openModelDropdown();
                }}
              >
                <span>{selectedModel || "كل الموديلات"}</span>
                <IoIosArrowDown
                  className={`arrow-icon ${showModelDropdown ? "rotate-icon" : ""}`}
                />
              </div>
              {showModelDropdown && (
                <ul
                  className={`dropdown-list-items ${modelAnimation === "show" ? "" : "dropdown-closing"}`}
                  onAnimationEnd={() => {
                    if (modelAnimation === "hide") setShowModelDropdown(false);
                  }}
                >
                  <li
                    className={selectedModel === "" ? "selected" : ""}
                    onClick={() => handleModelSelect("")}
                  >
                    كل الموديلات
                  </li>
                  {models.map((model) => (
                    <li
                      key={`custom-model-${model}`}
                      className={selectedModel === model ? "selected" : ""}
                      onClick={() => handleModelSelect(model)}
                    >
                      {model}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <input
              type="number"
              placeholder="أقصى سعر..."
              className="price-input"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="boxMainCardCar">
        {loading ? (
          [1, 2, 3].map((n) => <CarSkeleton key={n} />)
        ) : filteredCars.length === 0 ? (
          <div className="no-results">لا توجد سيارات تطابق بحثك</div>
        ) : (
          filteredCars
            .slice()
            .reverse()
            .map((car) => (
              <div className="CardCar" key={car._id}>
                <div className="infoCar">
                  <div className="CarimagAndinfo">
                    <div className="CarImage">
                      <img src={car.images} />
                    </div>
                    <div className="Carinfo">
                      <h3>
                        {car.brand}-{car.model}
                      </h3>
                      <h5>{car.year}</h5>
                      <h4>
                        {car.mileage.value} / {car.mileage.unit}
                      </h4>
                      <h5>{car.color}</h5>
                      <h5>
                        {car.engine.transmission === "automatic"
                          ? "اوتوماتيك"
                          : car.engine.transmission === "normal"
                            ? "غيار عادي "
                            : "غير محدد"}
                      </h5>
                      <h5>
                        {car.engine.fulType === "gasoline"
                          ? "بانزين"
                          : car.engine.fulType === "diesel"
                            ? "ديزل"
                            : car.engine.fulType === "electricity"
                              ? "كهربائية"
                              : car.engine.fulType === "Hybrid"
                                ? "هايبرد"
                                : "غير محدد"}
                      </h5>
                    </div>
                  </div>
                  <div className="CarStatus">
                    <h4
                      style={{
                        color:
                          car.status === "sold"
                            ? "rgb(228, 13, 13)"
                            : car.status === "available"
                              ? "rgb(44, 109, 44)"
                              : "black",
                        backgroundColor:
                          car.status === "sold"
                            ? "rgb(221, 140, 140)"
                            : car.status === "available"
                              ? "rgb(167, 224, 167)"
                              : "black"
                      }}
                    >
                      {car.status === "available" ? "متوفرة" : "غير متوفرة"}
                    </h4>
                  </div>
                  <div className="CarPriceAndEdite">
                    <div className="box-QrCodeCar">
                      <QRCodeCanvas value={car.qrCode} size={90} />
                    </div>
                    <div className="PraiceAndEditeCar">
                      <div className="price">
                        <h3>{car.price}</h3>
                        <AiFillDollarCircle className="icon-price" />
                      </div>
                      <div className="buttonEditeCar">
                        <Link to={`/Dashbord/allcar/editCar/${car._id}`}>
                          التفاصيل
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                <hr />
                <div className="BoxCarDetils">
                  <div className="BoxFeatures">
                    {/* Safety */}
                    <div
                      className="safetyFeatures"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(car.safetyFeatures);
                      }}
                    >
                      <p>ميزات الامان</p>
                      <FaAngleUp />
                      {activeFeatures === car.safetyFeatures && (
                        <div
                          className={`FloatingDiv ${closingFeatures === car.safetyFeatures ? "floating-closing" : ""}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {car.safetyFeatures.map((f, index) => (
                            <span key={index}>{f}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Comfort */}
                    <div
                      className="comfortFeatures"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(car.comfortFeatures);
                      }}
                    >
                      <p>ميزات الراحة</p>
                      <FaAngleUp />
                      {activeFeatures === car.comfortFeatures && (
                        <div
                          className={`FloatingDiv ${closingFeatures === car.comfortFeatures ? "floating-closing" : ""}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {car.comfortFeatures.map((f, index) => (
                            <span key={index}>{f}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Tech */}
                    <div
                      className="techFeatures"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(car.techFeatures);
                      }}
                    >
                      <p>ميزات التكنلوجيا</p>
                      <FaAngleUp />
                      {activeFeatures === car.techFeatures && (
                        <div
                          className={`FloatingDiv ${closingFeatures === car.techFeatures ? "floating-closing" : ""}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {car.techFeatures.map((f, index) => (
                            <span key={index}>{f}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="BoxFileDataCar">
                    <button
                      onClick={async () => {
                        const { pdf } = await import("@react-pdf/renderer");
                        const blob = await pdf(
                          <CarPdfDocument car={car} />
                        ).toBlob();
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `${car.brand}.pdf`;
                        link.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      تحميل ملف السيارة
                    </button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
