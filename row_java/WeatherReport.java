
public class WeatherReport {
        private String lat;
        private String lon;
        private String temp;
        private String hum;
        private String rain;
        private String rec_time;

        public WeatherReport(String lat, String lon, String temp, String hum, String rain, String rec_time) {
            this.lat = lat;
            this.lon = lon;
            this.temp = temp;
            this.hum = hum;
            this.rain = rain;
            this.rec_time = rec_time;
        }

        public String getLat() {
            return lat;
        }

        public void setLat(String lat) {
            this.lat = lat;
        }

        public String getLon() {
            return lon;
        }

        public void setLon(String lon) {
            this.lon = lon;
        }

        public String getTemp() {
            return temp;
        }

        public void setTemp(String temp) {
            this.temp = temp;
        }

        public String getHum() {
            return hum;
        }

        public void setHum(String hum) {
            this.hum = hum;
        }

        public String getRain() {
            return rain;
        }

        public void setRain(String rain) {
            this.rain = rain;
        }

        public String getRec_time() {
            return rec_time;
        }

        public void setRec_time(String rec_time) {
            this.rec_time = rec_time;
        }
    }