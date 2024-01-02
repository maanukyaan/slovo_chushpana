import { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import "./index.css";
import hero from "./img/hero.webp";
import { MoonLoader } from "react-spinners";

function App() {
  const [selectedGender, setSelectedGender] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultImageUrl, setResultImageUrl] = useState(null);

  const handleGenderClick = (gender) => {
    setSelectedGender(gender);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);
  };

  const handleFormSubmit = async () => {
    if (selectedImage && selectedGender) {
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("gender", selectedGender);

      setLoading(true);
      toast.loading("Генерируем фотку. Спокуха, ща всё будет...", {
        duration: 2000,
      });

      try {
        const response = await axios.post(
          "http://localhost:7777/generate",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setResultImageUrl(response.data.resultImageUrl);
        toast.success("Получилось, иди глянь");
      } catch (error) {
        console.error("Error submitting the form:", error);
        toast.error("Чё то пошло не так. Попробуй ка ещё разок.");
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Выбери изображение и пол. Ты чё?");
    }
  };

  const renderResultContent = () => {
    return (
      <div className="result-container">
        <h2
          style={{
            fontFamily: "Lozung",
          }}
        >
          Результат:
        </h2>
        <img src={resultImageUrl} alt="Generated Result" style={{
          margin: "20px 0"
        }} />

        <div className="buttons-container">
          <button
            className="btn pay-download-btn"
            onClick={handlePayAndDownload}
          >
            Скачать без водяного знака (300₽)
          </button>
          <button
            className="btn download-btn"
            onClick={handleDownloadWithWatermark}
          >
            Скачать бесплатно
          </button>
        </div>
      </div>
    );
  };

  const handleDownloadWithWatermark = () => {
    toast.success("Скачиваем изображение с водяным знаком))))");
  };

  const handlePayAndDownload = () => {
    toast.loading("Сейчас ты будешь перенаправлен на страницу оплаты...", {
      duration: 3000,
    });
  };

  return (
    <div className="App">
      <Toaster />
      <h1>
        Слово чушпана <br /> Реферат на асфальте
      </h1>

      {resultImageUrl ? (
        renderResultContent()
      ) : loading ? (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <MoonLoader color="#ffffff" size={70} />
        </div>
      ) : (
        <>
          <div className="container introducion">
            <p>
              <b>Так кто ты? Пацан или чушпан?</b>
              <br /> <br />
              Загрузи свою фотку в нашу машину прошлого и узнай, как бы ты
              одевался, где жил и с кем дружил в далёкие 8Oе.
            </p>

            <img src={hero} alt="Hero" />
          </div>
          <div className="container upload">
            <div className="left">
              <span>
                Сними хорошее селфи <br /> (смотри в камеру, сними очки, и не
                тряси рукой, не обидим)
              </span>
              <label
                htmlFor="images"
                className="drop-container"
                id="dropcontainer"
              >
                <span className="drop-title">Брось изображение сюда</span>
                ну или
                <input
                  type="file"
                  id="images"
                  accept="image/*"
                  required
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <div className="right">
              <h2>Кто я?</h2>

              <div className="btn_group">
                <button
                  className={`btn ${selectedGender === "male" ? "active" : ""}`}
                  onClick={() => handleGenderClick("male")}
                >
                  Мужчина
                </button>
                <button
                  className={`btn ${
                    selectedGender === "female" ? "active" : ""
                  }`}
                  onClick={() => handleGenderClick("female")}
                >
                  Женщина
                </button>
              </div>

              <button type="submit" className="btn" onClick={handleFormSubmit}>
                Отправь меня в прошлое!
              </button>
            </div>
          </div>
        </>
      )}

      {!loading ? (
        <footer>
          <a
            href="https://docs.google.com/document/d/1BQEgmS33P0riANJvDyiEsk_TyBvWwGm6qo1ETTBg4as"
            target="_blank"
            rel="noreferrer"
          >
            Политика конфиденциальности
          </a>
          <a href="mailto:sashafrutonyasha@yandex.ru">
            sashafrutonyasha@yandex.ru
          </a>
          <p>ИНН: 505078177790</p>
        </footer>
      ) : null}
    </div>
  );
}

export default App;
