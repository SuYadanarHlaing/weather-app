import { useState, useEffect } from "react"; 
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const apiKey = "e66dc79ba8327e8edf2ede9522f79f28";

function App() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [cityName, setCityName] = useState("Tokyo");
  const [cityList] = useState([
    "Tokyo", "New York", "Myanmar", "Paris", "Dubai", "Seoul"
  ]);
  const [isDarkMode, setIsDarkMode] = useState(false); // ダークモードの状態を管理

  useEffect(() => {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&cnt=24&appid=${apiKey}&units=metric&lang=ja`;

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }
        return response.json();
      })
      .then((data) => setWeather(data))
      .catch((err) => setError(err.message));
    
    // ダークモードのテーマを変更
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [cityName, isDarkMode]);

  if (error) {
    return <div className="error">エラー: {error}</div>;
  }

  if (!weather) {
    return <div>データを取得中...</div>;
  }

  const today = [];
  const tomorrow = [];
  const dayAfterTomorrow = [];

  const now = new Date();
  const todayDate = now.setHours(0, 0, 0, 0);
  const tomorrowDate = new Date(now).setDate(now.getDate() + 1);
  const dayAfterTomorrowDate = new Date(now).setDate(now.getDate() + 2);

  weather.list.forEach((forecast) => {
    const forecastDate = new Date(forecast.dt * 1000).setHours(0, 0, 0, 0);

    const tempData = {
      time: new Date(forecast.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temp: forecast.main.temp,
      feelsLike: forecast.main.feels_like,
      humidity: forecast.main.humidity,
      icon: forecast.weather[0].icon,
      description: forecast.weather[0].description,
    };

    if (forecastDate === todayDate) {
      today.push(tempData);
    } else if (forecastDate === tomorrowDate) {
      tomorrow.push(tempData);
    } else if (forecastDate === dayAfterTomorrowDate) {
      dayAfterTomorrow.push(tempData);
    }
  });

  const sunrise = new Date(weather.city.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const sunset = new Date(weather.city.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" }) + "日";

  const chartData = (data, label) => ({
    labels: data.map((d) => d.time),
    datasets: [
      {
        label,
        data: data.map((d) => d.temp),
        borderColor: "rgba(0, 123, 255, 0.8)",
        backgroundColor: "rgba(0, 123, 255, 0.3)",
        fill: true,
      },
    ],
  });

  // ダークモードを切り替える関数
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <div className="app-container">
      <h1>{cityName} の天気</h1>

      {/* ダークモード切り替えボタン */}
      <button onClick={toggleTheme} className="theme-toggle-btn">
        {isDarkMode ? "ライトモード" : "ダークモード"}
      </button>

      <select
        value={cityName}
        onChange={(e) => setCityName(e.target.value)}
        className="city-select"
      >
        {cityList.map((city, index) => (
          <option key={index} value={city}>
            {city}
          </option>
        ))}
      </select>

      <div className="weather-cards-container">
        {[{ data: today, date: todayDate }, { data: tomorrow, date: tomorrowDate }, { data: dayAfterTomorrow, date: dayAfterTomorrowDate }].map(({ data, date }, index) => (
          <div className="weather-card" key={index}>
            <h2>{formatDate(date)}の天気</h2>
            {data.length > 0 ? (
              <>
                <img
                  src={`http://openweathermap.org/img/wn/${data[0].icon}.png`}
                  alt="weather icon"
                  className="weather-icon"
                />
                <p>{data[0].description}</p>
                <p>気温: {data[0].temp}°C</p>
                <p>体感温度: {data[0].feelsLike}°C</p>
                <p>湿度: {data[0].humidity}%</p>
                <p>日の出: {sunrise}</p>
                <p>日の入り: {sunset}</p>
                <Line data={chartData(data, formatDate(date))} />
              </>
            ) : (
              <p>データがありません</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
