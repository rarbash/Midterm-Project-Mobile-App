import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Button,
  TouchableHighlight,
  Dimensions,
  Platform,
  ImageBackground,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons1 from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons2 from "react-native-vector-icons/Ionicons";
import StockButton from "./StockButton";
import { BarChart } from "react-native-chart-kit";
import API from "./api.js";
import * as Location from "expo-location";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";

const chartConfig = {
  backgroundGradientFrom: "#394242",
  backgroundGradientTo: "#0d1113",
  backgroundGradientFromOpacity: 0.75,
  backgroundGradientToOpacity: 0.75,
  color: (opacity = 0) => `rgba(255, 255, 255, ${opacity})`, // color of background
  strokeWidth: 2, // optional, default 3
  barPercentage: 0.5,
};

function WobbleButton(props) {
  const rotation = useSharedValue(0);
  // const
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateZ: `${rotation.value}deg` }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <StockButton
        code={props.code}
        name={props.name}
        backgroundColor={props.backgroundColor}
        textColor={props.textColor}
        index={props.index}
        onPress={() => {
          let isWorking = props.onPress(props.code, props.name, props.index);
          if (isWorking) {
            return;
          }
          rotation.value = withSequence(
            withTiming(-7, { duration: 35 }),
            withRepeat(withTiming(7, { duration: 70 }), 6, true),
            withTiming(0, { duration: 35 })
          );
        }}
      />
    </Animated.View>
  );
}

class CityNameScreen extends Component {
  constructor(props) {
    super(props);
    this.changeIndex = this.changeIndex.bind(this);
    this.animateChange = this.animateChange.bind(this);
    this.highlightBGColors = this.highlightBGColors.bind(this);
    this.state = {
      date: ["01/01", "02/01", "03/01", "04/01", "05/01", "06/01", "07/01"],
      weather: ["sunny", "sunny", "sunny", "sunny", "sunny", "sunny", "sunny"],
      temperature: ["1", "2", "3", "4", "5", "6", "7"],
      city: "Please Select City",
      animationLoop: 0,
      working: false,
      backgroundColors: [
        "rgba(13, 17, 19, 0.8)",
        "rgba(13, 17, 19, 0.8)",
        "rgba(13, 17, 19, 0.8)",
        "rgba(13, 17, 19, 0.8)",
      ],
      textColors: ["#f2f6f7", "#f2f6f7", "#f2f6f7", "#f2f6f7"],
    };
  }

  highlightBGColors(index) {
    let newBGColors = [
      "rgba(13, 17, 19, 0.8)",
      "rgba(13, 17, 19, 0.8)",
      "rgba(13, 17, 19, 0.8)",
      "rgba(13, 17, 19, 0.8)",
    ];
    let newTextColors = ["#f2f6f7", "#f2f6f7", "#f2f6f7", "#f2f6f7"];
    newBGColors[index] = "rgba(255, 255, 255, 0.8)";
    newTextColors[index] = "black";
    this.setState({
      backgroundColors: newBGColors,
      textColors: newTextColors,
    });
  }

  animateChange(newTemperature) {
    let prevTemperature = this.state.temperature;
    let dif = newTemperature.map(
      (e, i) => (parseFloat(e) - parseFloat(prevTemperature[i])) / 60
    );
    this.interval = setInterval(() => {
      this.setState({
        temperature: this.state.temperature.map((e, i) =>
          (parseFloat(e) + dif[i]).toString()
        ),
        animationLoop: this.state.animationLoop + 1,
      });
      if (this.state.animationLoop >= 60) {
        this.setState({
          animationLoop: 0,
          working: false,
        });
        clearInterval(this.interval);
      }
    }, 5);
  }

  changeIndex(citycode, cityname, index) {
    if (this.state.working || cityname == this.state.city) {
      return true;
    }
    this.highlightBGColors(index);
    API(citycode, true).then((data) => {
      var dateArray = [];
      let weatherArray = [];
      let temperatureArray = [];
      if (data) {
        this.setState({ working: true });
        data.forEach((date) => {
          dateArray.push(date["date"].slice(5, 10));
          weatherArray.push(date["weather"]);
          temperatureArray.push(date["temperature"].toFixed(2));
        });
        this.setState({
          date: dateArray,
          weather: weatherArray,
          city: cityname,
        });
        this.animateChange(temperatureArray);
      }
    });
    return false;
  }

  icons() {
    return this.state.weather.map(function (weather, index) {
      if (weather == "cloudy") {
        icon = require("./weather_icons/cloudy.png");
      } else if (weather == "rainy") {
        icon = require("./weather_icons/rainy.png");
      } else if (weather == "sunny") {
        icon = require("./weather_icons/sunny.png");
      } else {
        icon = require("./weather_icons/windy.png");
      }
      return (
        <View key={index}>
          <Image source={icon} style={{ width: 20, height: 20 }} />
        </View>
      );
    });
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ImageBackground
          source={require("./weather_icons/background.gif")}
          resizeMode="cover"
          style={{ flex: 1, justifyContent: "center" }}
        >
          <BarChart
            data={{
              // labels: this.state.weather,
              labels: this.state.date,
              labels: this.state.date,
              datasets: [
                {
                  data: this.state.temperature,
                },
              ],
            }}
            width={350}
            height={350}
            yAxisLabel="°C "
            chartConfig={chartConfig}
            verticalLabelRotation={0}
            fromZero={true}
            style={style.chart}
          />
          <View style={style.iconCity}>{this.icons()}</View>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              // backgroundColor: "pink",
            }}
          >
            <Text style={style.text}>{this.state.city}</Text>
          </View>

          <View
            style={{
              flex: 2,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <View>
              <WobbleButton
                code="BKK"
                name="Bangkok"
                onPress={this.changeIndex}
                backgroundColor={this.state.backgroundColors[0]}
                textColor={this.state.textColors[0]}
                index={0}
              />
              <WobbleButton
                code="CNX"
                name="Chiang Mai"
                onPress={this.changeIndex}
                backgroundColor={this.state.backgroundColors[1]}
                textColor={this.state.textColors[1]}
                index={1}
              />
            </View>
            <View>
              <WobbleButton
                code="HKT"
                name="Phuket"
                onPress={this.changeIndex}
                backgroundColor={this.state.backgroundColors[2]}
                textColor={this.state.textColors[2]}
                index={2}
              />
              <WobbleButton
                code="KKC"
                name="Khon Kaen"
                onPress={this.changeIndex}
                backgroundColor={this.state.backgroundColors[3]}
                textColor={this.state.textColors[3]}
                index={3}
              />
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  }
}

class LatLongScreen extends Component {
  constructor(props) {
    super(props);
    this.onRegionChangeComplete = this.onRegionChangeComplete.bind(this);
    this.animateChange = this.animateChange.bind(this);
    this.state = {
      latitude: 10,
      longitude: 10,
      hour: ["12AM", "3AM", "6AM", "9AM", "12PM", "3PM", "6PM", "9PM"],
      weather: [
        "sunny",
        "sunny",
        "sunny",
        "sunny",
        "sunny",
        "sunny",
        "sunny",
        "sunny",
      ],
      temperature: ["1", "2", "3", "4", "5", "6", "7", "8"],
      location: null,
      animationLoop: 0,
      working: false,
    };
  }

  animateChange(newTemperature) {
    if (this.state.working) {
      return;
    }
    this.setState({ working: true });
    let prevTemperature = this.state.temperature;
    let dif = newTemperature.map(
      (e, i) => (parseFloat(e) - parseFloat(prevTemperature[i])) / 60
    );
    this.interval = setInterval(() => {
      this.setState({
        temperature: this.state.temperature.map((e, i) =>
          (parseFloat(e) + dif[i]).toString()
        ),
        animationLoop: this.state.animationLoop + 1,
      });
      if (this.state.animationLoop >= 60) {
        this.setState({
          animationLoop: 0,
          working: false,
        });
        clearInterval(this.interval);
      }
    }, 5);
  }

  onRegionChangeComplete(region) {
    this.setState({ region });
  }

  componentDidMount() {
    if (Platform.OS === "android" && !Constants.isDevice) {
      this.setState({
        errorMessage:
          "Oops, this will not work on Sketch in an Android emulator. Try it on your device!",
      });
    } else {
      this._getLocationAsync();
    }
  }

  _getLocationAsync = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      this.setState({
        errorMessage: "Permission to access location was denied",
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      location: location,
    });
    var latlongcombine = this.state.latitude + "," + this.state.longitude;
    API(latlongcombine, false).then((data) => {
      var hourArray = [];
      let weatherArray = [];
      let temperatureArray = [];
      if (data) {
        data.forEach((hour) => {
          hourArray.push(hour["hour"].replace(/\s/g, ""));
          weatherArray.push(hour["weather"]);
          temperatureArray.push(hour["temperature"]);
        });
        this.setState({
          hour: hourArray,
          weather: weatherArray,
        });
      }
      this.animateChange(temperatureArray);
    });
  };

  icons() {
    return this.state.weather.map(function (weather, index) {
      if (weather == "cloudy") {
        icon = require("./weather_icons/cloudy.png");
      } else if (weather == "rainy") {
        icon = require("./weather_icons/rainy.png");
      } else if (weather == "sunny") {
        icon = require("./weather_icons/sunny.png");
      } else {
        icon = require("./weather_icons/windy.png");
      }
      return (
        <View key={index}>
          <Image source={icon} style={{ width: 20, height: 20 }} />
        </View>
      );
    });
  }

  render() {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ImageBackground
          source={require("./weather_icons/background2.gif")}
          resizeMode="cover"
          style={{ flex: 1, justifyContent: "center" }}
        >
          <View style={{ flex: 1 }}>
            <BarChart
              data={{
                labels: this.state.hour,
                // labels: this.state.weather,
                datasets: [
                  {
                    data: this.state.temperature,
                  },
                ],
              }}
              width={350}
              height={350}
              yAxisLabel="°C "
              chartConfig={chartConfig}
              verticalLabelRotation={0}
              fromZero={true}
              style={style.chart}
            />
            <View style={style.iconLatLong}>{this.icons()}</View>
          </View>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text style={style.textLatlon}>
              Weather on your current location
            </Text>
            <Text style={style.textLatlon}>Please wait just a sec :)</Text>
          </View>
        </ImageBackground>
      </View>
    );
  }
}

const Tab = createBottomTabNavigator();

export default class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === "City Name") {
                iconName = focused ? "home-city" : "home-city-outline";
                return <Ionicons1 name={iconName} size={size} color={color} />;
              } else if (route.name === "Lat-Long") {
                iconName = focused ? "location" : "location-outline";
                return <Ionicons2 name={iconName} size={size} color={color} />;
              }
            },
            tabBarActiveTintColor: "black",
            tabBarInactiveTintColor: "gray",
          })}
        >
          <Tab.Screen name="City Name" style={{ backgroundColor: "pink" }}>
            {(props) => <CityNameScreen {...props} />}
          </Tab.Screen>
          <Tab.Screen name="Lat-Long">
            {(props) => <LatLongScreen {...props} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
}

const style = StyleSheet.create({
  iconCity: {
    width: 265,
    top: 345,
    left: 100,
    position: "absolute",

    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  iconLatLong: {
    width: 273,
    top: 345,
    left: 100,
    position: "absolute",

    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  text: {
    color: "#f2f6f7",
    fontSize: 28,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },

  textLatlon: {
    color: "#f2f6f7",
    fontSize: 20,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },

  chart: {
    margin: 30,
    marginBottom: 0,
    borderRadius: 13,
  },

  backgound: {
    backgroundColor: "white",
  },
});
