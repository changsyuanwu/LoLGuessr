const numOptions = 4;
let score = 0;
const getChampionNames = async () => {
  const url =
    "https://ddragon.leagueoflegends.com/cdn/11.23.1/data/en_US/champion.json";
  const res = await fetch(url);
  const json = await res.json();
  return Object.keys(json.data);
};

async function getRandomChampions() {
  const champNames = await getChampionNames();
  let champs = [];
  while (champs.length < numOptions) {
    const randChamp = champNames[Math.floor(Math.random() * champNames.length)];
    if (!champs.includes(randChamp)) {
      champs.push(randChamp);
    }
  }
  return champs;
}

const getChampionJson = async (champName) => {
  const url = `https://ddragon.leagueoflegends.com/cdn/11.23.1/data/en_US/champion/${champName}.json`;
  const res = await fetch(url);
  const json = await res.json();
  return json.data[champName];
};

const getRandomImageType = async () => {
  const imageTypes = ["centered", "loading", "splash", "tiles"];
  return imageTypes[Math.floor(Math.random() * imageTypes.length)];
};

const getChampionImage = async (champName, skinNum) => {
  let img = new Image();
  const imageType = await getRandomImageType();
  const url = `https://ddragon.leagueoflegends.com/cdn/img/champion/${imageType}/${champName}_${skinNum}.jpg`;
  const imgCard = document.querySelector("#img-card");
  imgCard.append(img);
  img.src = url;
  img.classList.add("h-100");
};

const run = async () => {
  const champs = await getRandomChampions();
  const champName = champs[Math.floor(Math.random() * champs.length)];
  const json = await getChampionJson(champName);
  const skins = json.skins;
  const randSkinObj = skins[Math.floor(Math.random() * skins.length)];
  await getChampionImage(champName, randSkinObj.num);

  const btn_wrapper = document.getElementById("btn-wrapper");

  champs.forEach((champ) => {
    const btn = document.createElement("button");
    btn.classList.add("btn", "btn-info", "w-100", "my-2", "option-btn");
    btn.textContent = champ;

    if (champ === champName) {
      btn.id = "correct";
    }

    const content = `
            <div class="col-sm-6 col-md-4 col-lg-3">
                ${btn.outerHTML}
            </div>
        `;
    btn_wrapper.insertAdjacentHTML("afterbegin", content);
  });

  const btns = document.querySelectorAll(".option-btn");

  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.id === "correct") {
        score++;
        win();
      } else {
        lose();
      }
    });
  });
};

run();

const win = () => {
  const scoreSpan = document.getElementById("score");
  const btn_wrapper = document.getElementById("btn-wrapper");
  const imgCard = document.querySelector("#img-card");
  scoreSpan.textContent = score;
  btn_wrapper.innerHTML = "";
  imgCard.innerHTML = "";
  run();
};

const lose = () => {
  const scoreSpan = document.getElementById("score");
  const btn_wrapper = document.getElementById("btn-wrapper");
  const imgCard = document.querySelector("#img-card");
  const restart = document.createElement("button");
  if (score <= badScore) {
    imgCard.innerHTML = `
            <img src="images/Emblem_Iron.png" class="h-100" />
             <h5 class="text-center text-light">
                Yikers bro! You only got a score of <span class="text-success">${score}</span>! Gotta grind more League...
            </h5>
        `;
  } else if (score <= decentScore) {
    imgCard.innerHTML = `
            <img src="images/Emblem_Platinum.png" class="h-100" />
            <h5 class="text-center text-light">
                Hey not bad! You got <span class="text-success">${score}</span> right!
            </h5>
        `;
  } else {
    imgCard.innerHTML = `
            <img src="images/Emblem_Challenger.png" class="h-100" />
            <h5 class="text-center text-light">
                Seriously? Either this quiz is too easy or you play too much League. <span class="text-success">${score}</span>!
            </h5>
        `;
  }
  scoreSpan.textContent = score;

  restart.classList.add("btn", "btn-success", "my-2", "w-50", "mx-auto");
  restart.textContent = "Try Again";
  restart.addEventListener("click", () => {
    score = 0;
    btn_wrapper.innerHTML = "";
    imgCard.innerHTML = "";
    scoreSpan.textContent = score;
    run();
  });

  btn_wrapper.innerHTML = "";
  btn_wrapper.append(restart);
};
