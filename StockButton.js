import React, { Component } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default class StocksButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clickCity: "none",
    };
  }

  render() {
    return (
      <View>
        <TouchableOpacity
          onPress={() => {
            // console.log(this.props.index);
            this.props.onPress(
              this.props.code,
              this.props.name,
              this.props.index
            );
            this.setState({
              clickCity: this.props.name,
            });
          }}
          style={[
            styles.button,
            { backgroundColor: this.props.backgroundColor },
          ]}
        >
          <Text style={[styles.text, { color: this.props.textColor }]}>
            {this.props.name}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    margin: 10,
    height: 50,
    width: 100,

    borderRadius: 10,

    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(13, 17, 19, 0.8)",
  },

  buttonOnclick: {
    margin: 10,
    height: 50,
    width: 100,

    borderRadius: 10,

    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },

  text: {
    color: "#f2f6f7",
    fontWeight: "550",
  },

  textOnclick: {
    color: "black",
    fontWeight: "550",
  },
});
