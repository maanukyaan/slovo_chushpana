const express = require("express");
const path = require("path");
const axios = require("axios");
const bodyParser = require("body-parser");
const fs = require("fs");
const fsp = require("fs").promises;
const multer = require("multer");
const { error } = require("console");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://xn--e1ap7cc.xn--p1ai");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

let apiUrl = "https://modelslab.com/api/v6/realtime/img2img";
// apiUrl = "https://stablediffusionapi.com/api/v3/img2img";
const apiKey = process.env.API_KEY || "";

const imgFolderPath = path.join(__dirname, "img");
fsp
  .access(imgFolderPath)
  .then(() => {
    console.log("Folder 'img' exists.");
  })
  .catch(async () => {
    console.log("Folder 'img' does not exist. Creating...");
    await fsp.mkdir(imgFolderPath);
    console.log("Folder 'img' created successfully.");
  });

app.use("/img", express.static(path.join(__dirname, "img/")));

const uniqueImageId = generateId(12);
// Adding Multer middleware to handle image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "img/");
  },
  filename: function (req, file, cb) {
    cb(null, `${uniqueImageId}.jpg`);
  },
});

const upload = multer({ storage: storage });

let serverUrl = "https://duhiglolee.beget.app";

app.post("/generate", upload.single("image"), async (req, res) => {
  const imgUrl = `${serverUrl}/img/${uniqueImageId}.jpg`;
  const gender = req.body.gender;
  try {
    const response = await axios.post(
      apiUrl,
      {
        key: apiKey,
        prompt: `High quality, 80s Soviet style, Create atmospheric images inspired by the style and aesthetics of the Soviet Union during the late 1980s. Transfer to the canvas the features of street life of that time, reflecting the characteristic features of youth groups: clothing style, street atmosphere, characteristic locations. Transform your photographs into unique scenes that capture the spirit of a time and place. Try to convey the spirit of the era through the details and atmosphere of each image you create. Immerse yourself in the gang life of late 1980s Russian criminal gangs through your creative images. Your task is to capture the spirit of youth groups of that time through vivid, emotional scenes. Use period clothing, streetscapes, and architecture to embody the atmosphere of the time. Your work should not be just images, but time capsules that embody the freedom, edginess and spirit of the 80s. Detail each painting with meticulous attention to detail so that the viewer can feel the pulse of the era in every frame. Create images that convey the dark and negative aspects of youth gang life in Russia in the late 1980s. Delve into aspects of the social issues, incredible challenges and conflicts of the time. Use dark colors and moody compositions to convey the atmosphere of tension, danger and instability that the youth experienced. Your task is to evoke emotions of anxiety and dissatisfaction, reflecting the dark sides of the social reality of that era. ${generateRandomPrompt(
          gender
        )}`,
        negative_prompt:
          "American style, non Soviet, bad anatomy, bad hands, three hands, three legs, bad arms, missing legs, missing arms, poorly drawn face, bad face, fused face, cloned face, worst face, three crus, extra crus, fused crus, worst feet, three feet, fused feet, fused thigh, three thigh, fused thigh, extra thigh, worst thigh, missing fingers, extra fingers, ugly fingers, long fingers, horn, extra eyes, huge eyes, 2girl, amputation, disconnected limbs, cartoon, cg, 3d, unreal, animate, worst quality, normal quality, low quality, low res, blurry, text, watermark, logo, banner, extra digits, cropped, jpeg artifacts, signature, username, error, sketch ,duplicate, ugly, monochrome, horror, geometry, mutation, disgusting, lowres, text, error, cropped, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, out of frame, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck, username, watermark, signature",
        init_image: imgUrl,
        width: "512",
        height: "512",
        samples: "1",
        num_inference_steps: "30",
        temp: false,
        safety_checker: false,
        guidance_scale: 7.5,
        strength: 0.7,
        seed: null,
        webhook: null,
        track_id: null,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    let resultImageUrl;
    if (response.data.output && response.data.output.length > 0) {
      resultImageUrl = response.data.output[0];
    } else {
      throw new Error(error.message);
    }

    console.log("Result image url: ", resultImageUrl);
    res.status(200).json({ resultImageUrl });

    await fsp.unlink(path.join(__dirname, "img", `${uniqueImageId}.jpg`));
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "index.html"));
});

function generateId(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

function generateRandomPrompt(gender) {
  // Предложения для мужчин
  const malePrompts = [
    "Man, Winter, hockey box, Khrushchev, school, black trees, sweatpants, Soviet sheepskin coat, large knitted sweater with a high neck, hat",
    "Man, Dorm room, gas stove, Soviet faucet, green tile, painted walls, gas pipe, table, oilcloth tablecloth in a cage, Soviet mug with a picture of a bear Olympics of the 80s, a plate with a blue border, guitar, stretched sweater, little body, mustache",
    "Man, Winter, trees, men's muskrat hat, red plaid mohair scarf, Soviet patterned sweater, leather jacket, Khrushchev",
    "Man, Winter, hockey box, boys,blue sky, wires, school, cockerel hat, Olympic jacket with fur collar",
    "Man, Red Soviet Sofa, carpet, green wallpaper, blue jeans, beige leather belt, varenka shirt with the US eagle on the chest, mustache, bangs, elongated haircut",
    "Man, Soviet school uniform, red tie, white shirt, iron bowl, spoon, compote in a faceted glass, Soviet clock, table, Soviet fresco, wooden panels on the wall",
    "A man, red-and-white striped wallpaper, a quilted leather door, an old electric meter, loops with clothes, a briefcase, a double-breasted gray coat with a button belt, a fur black collar, a red terry scarf, bangs on the side, a muskrat hat, a briefcase",
    "A man, a mink men's hat, a brown sheepskin coat with buttons, a blue shirt, a plaid tie, a mustache, a live Christmas tree in his hands, a quilted korichev door, green painted walls of the entrance",
  ];

  // Предложения для женщин
  const femalePrompts = [
    "Background: school toilet wall: small gray square tiles, white whitewash from the middle of the wall, inscriptions on the whitewash. A woman, Her hair is gathered on top of her head in a voluminous rubber on her side, her hair is in a tail of small curls, her eyes are unpainted with dark brown shadows up to her eyebrows, bardic lipstick, blush, a voluminous sweater with an active small argument in a horizontal stripe.",
    "A woman, a voluminous arctic fox hat, provocative makeup, chemicals on her hair, a mink fur coat, a plaid scarf, bracelets on her arm, tights, sits on a sofa covered with an old gray bedspread with an ornament, greasy beige wallpaper with an ornament on the back, a plastic Soviet declared outlet.",
    "Woman, Staged photo, red fabric obliquely, sweater with arnament, 2 thin chains, eyes circled in black, dark shadows up to the eyebrows, brown lipstick, mohair hat.",
    "Фон однотонный (висящая ткань), волосы в стиле 80х, объёмный верх, волосы укорочены, нижняя часть волос длиннее, платье с воротником и рюшами на груди, длинные рукава.",
    "Soviet schoolgirl, hair gathered in a braid, red pioneer tie, white apron, Komsomol member badge, dark brown Soviet dress, background:schools of paradise have a green board, posters from biology lessons.",
    "Background: old tube TVs, vases, sets, old tape recorders, saleswoman: dissatisfied face, black eyeliner, blush, Boron lipstick, overweight, saleswoman's uniform: beige dress with lantern sleeves and a large pointed collar, blue robe with a folding collar on top, Soviet newspaper in her hands, sitting, glass showcase, There are large abacus and a Rubik's cube in the window.",
    "Background: an old low Soviet wardrobe, lacquered chipboard, a Soviet radio on the cabinet, a Soviet sideboard with crystal, a woman, a fur hat, a winter coat with buttons unbuttoned, a sweater with a button ornament, a Soviet bag.",
    "Background: winter, Khrushchev, an old Soviet green truck, a Soviet playground, a woman, a fur hat, a green spacious coat with large lapels, a calico scarf with an ornament, a bag, overweight",
  ];

  // Выбираем массив в зависимости от пола
  const prompts = gender === "male" ? malePrompts : femalePrompts;

  // Генерируем случайный индекс
  const randomIndex = Math.floor(Math.random() * prompts.length);

  // Возвращаем случайное предложение
  return prompts[randomIndex];
}
