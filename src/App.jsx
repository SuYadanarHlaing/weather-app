import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const apiKey = "e66dc79ba8327e8edf2ede9522f79f28";
const city = "Tokyo";

function App() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&cnt=24&appid=${apiKey}&units=metric&lang=ja`;

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }
        return response.json();
      })
      .then((data) => setWeather(data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div className="error">エラー: {error}</div>;
  }

  if (!weather) {
    return <div>データを取得中...</div>;
  }

  // 今日・明日・明後日のデータを整理
  const today = [];
  const tomorrow = [];
  const dayAfterTomorrow = [];

  const now = new Date();
  const todayDate = now.setHours(0, 0, 0, 0); // 今日の開始時間（00:00:00）
  const tomorrowDate = new Date(now).setDate(now.getDate() + 1); // 明日の開始時間
  const dayAfterTomorrowDate = new Date(now).setDate(now.getDate() + 2); // 明後日の開始時間

  weather.list.forEach((forecast) => {
    const forecastDate = new Date(forecast.dt * 1000).setHours(0, 0, 0, 0); // フォアキャストの日付（時間を00:00に設定）

    const tempData = {
      time: new Date(forecast.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // 時間を表示
      temp: forecast.main.temp,
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

  // 指定したフォーマットで日付を表示
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" }) + "日";

  // Chart.js 用データ
  const chartData = (data, label) => ({
    labels: data.map((d) => d.time),
    datasets: [
      {
        label,
        data: data.map((d) => d.temp),
        borderColor: "blue",
        backgroundColor: "rgb(133, 196, 256)",
        fill: true,
      },
    ],
  });

  return (
    <div className="app-container">
      <h1>東京の天気</h1>

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
