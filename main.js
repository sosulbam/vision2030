async function fetchSpreadsheetData(spreadsheetId, sheetName, apiKey) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch spreadsheet data");
  }

  const jsonResponse = await response.json();
  console.log(jsonResponse.values); // 이 부분을 추가합니다.
  return jsonResponse.values;
}


function createCountryItem(id, country) {
  const countryItem = document.createElement("div");
  countryItem.classList.add("country-item");
  countryItem.textContent = country.name;
  countryItem.setAttribute("onclick", `window.location.href='country-details.html?countryId=${id}';`);
  return countryItem;
}

function getCountryIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('countryId');
}

function findFlagImage(countryISO) {
  return new Promise(async (resolve) => {
    const checkImageExist = (url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
    };

    const gifUrl = `flags/${countryISO}_flag.gif`;
    const pngUrl = `flags/${countryISO}_flag.png`;

    if (await checkImageExist(gifUrl)) {
      resolve(gifUrl);
    } else if (await checkImageExist(pngUrl)) {
      resolve(pngUrl);
    } else {
      resolve(null);
    }
  });
}

async function findMapImage(countryISO) {
  const checkImageExist = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const mapUrl = `maps/${countryISO}_map.png`;

  if (await checkImageExist(mapUrl)) {
    return mapUrl;
  } else {
    return null;
  }
}


async function loadCountryDetails(countries) {
  const countryId = getCountryIdFromUrl();
  const country = countries[countryId];

  if (country) {
    document.getElementById("country-name").textContent = country.name;
    document.getElementById("country-info").innerText = country.info;
    document.getElementById("prayer-title").innerText = country.prayerTitle;

    // 국기 이미지 불러오기
    const flagImageSrc = await findFlagImage(country.ISO);
    if (flagImageSrc) {
      const flagImage = document.getElementById("country-flag");
      flagImage.src = flagImageSrc;
      flagImage.alt = `${country.name} 국기`;
      flagImage.width = 200; // 너비를 제한하려면 이 값을 조정하세요.
    } else {
      console.warn(`No flag image found for country: ${country.name}`);
    }

    // 지도 이미지 불러오기
    const mapImageSrc = await findMapImage(country.ISO);
    if (mapImageSrc) {
      const mapImage = document.getElementById("country-map");
      mapImage.src = mapImageSrc;
      mapImage.alt = `${country.name} 지도`;
      mapImage.width = 200; // 너비를 제한하려면 이 값을 조정하세요.
    } else {
      const mapImage = document.getElementById("country-map");
      mapImage.style.display = "none"; // 지도 이미지를 찾을 수 없으면 지도 이미지를 숨깁니다.
      console.warn(`No map image found for country: ${country.name}`);
    }
  } else {
    document.getElementById("country-details").innerHTML = '<p>해당 나라 정보를 찾을 수 없습니다.</p>';
  }
}



async function init() {
  const spreadsheetId = "1jUqP3JrHWFq5sGhytpi2y22LrX02t_IHMJmpfWYN2Z4"; // 수정된 부분: 스프레드시트 ID만 입력합니다.
  const sheetName = "Sheet1"; // 스프레드시트 내 워크시트 이름
  const apiKey = "AIzaSyCyOLd1uhGspLUnY4cgdQ6_zwk1TpfUcTQ";

  try {
    const spreadsheetData = await fetchSpreadsheetData(spreadsheetId, sheetName, apiKey);
    const countries = {};

    // 스프레드시트 데이터를 자바스크립트 객체로 변환
for (const row of spreadsheetData.slice(1)) { // 첫 번째 행(헤더)를 건너뜁니다.
  const id = row[0] || '';
  const iso = row[1] || '';
  const name = row[2] || '';
  const info = row[3] || '';
  const prayerTitle = row[4] || '';

  countries[id] = {
    ISO: iso,
    name: name,
    info: info,
    prayerTitle: prayerTitle,
  };
}

    if (document.getElementById("countries-table")) {
      const countriesTable = document.getElementById("countries-table");
  
      for (const id in countries) {
        const country = countries[id];
        const countryItem = createCountryItem(id, country);
        countriesTable.appendChild(countryItem);
      }
    } else if (document.getElementById("country-details")) {
      await loadCountryDetails(countries); // 여기에 await를 추가합니다.
    }
  } catch (error) {
    console.error("Error fetching spreadsheet data:", error);
    }
    }
    
    
    init();
