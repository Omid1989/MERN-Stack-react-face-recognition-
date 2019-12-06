import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import axios from "axios";
import { loadModels, getFullFaceDescription, createMatcher } from "../api/face";

// Import image to test API
const testImg = require("../img/test.jpg");

// Import face profile
//const JSON_PROFILE = require("../descriptors/bnk48.json");
//console.log(JSON_PROFILE);
// Initial State
const INIT_STATE = {
  imageURL: testImg,
  fullDesc: null,
  detections: null,
  descriptors: null,
  match: null,
  name: ""
};

class ImageInput extends Component {
  constructor(props) {
    super(props);
    this.state = { ...INIT_STATE, faceMatcher: null };
  }

  componentWillMount = async () => {
    try {
      let res = await axios.get("http://localhost:3001/api/getData");
      let face = res.data.data.JSON_PROFILE;
      await loadModels();
      await this.setState({
        faceMatcher: await createMatcher(face)
      });
      await this.handleImage(this.state.imageURL);
    } catch (e) {
      console.log(e);
    }
  };

  handleImage = async (image = this.state.imageURL) => {
    await getFullFaceDescription(image).then(fullDesc => {
      if (!!fullDesc) {
        this.setState({
          fullDesc,
          detections: fullDesc.map(fd => fd.detection),
          descriptors: fullDesc.map(fd => fd.descriptor)
        });
      }
    });
    console.log(this.state.descriptors);
    if (!!this.state.descriptors && !!this.state.faceMatcher) {
      let match = await this.state.descriptors.map(descriptor =>
        this.state.faceMatcher.findBestMatch(descriptor)
      );

      this.setState({ match });
    }
  };

  handleFileChange = async event => {
    this.resetState();
    await this.setState({
      imageURL: URL.createObjectURL(event.target.files[0]),
      loading: true
    });
    this.handleImage();
  };

  resetState = () => {
    this.setState({ ...INIT_STATE });
  };
  RegisterFace = () => {
    axios.post("http://localhost:3001/api/putData", {
      name: this.state.name,
      descriptors: this.state.descriptors
    });
    console.log(this.state.name);
  };

  handlechangename = e => {
    this.setState({ name: e.target.value });
  };
  render() {
    const { imageURL, detections, match } = this.state;

    let drawBox = null;
    if (!!detections) {
      drawBox = detections.map((detection, i) => {
        let _H = detection.box.height;
        let _W = detection.box.width;
        let _X = detection.box._x;
        let _Y = detection.box._y;
        return (
          <div key={i}>
            <div
              style={{
                position: "absolute",
                border: "solid",
                borderColor: "blue",
                height: _H,
                width: _W,
                transform: `translate(${_X}px,${_Y}px)`
              }}
            >
              {!!match ? (
                <p
                  style={{
                    backgroundColor: "blue",
                    border: "solid",
                    borderColor: "blue",
                    width: _W,
                    marginTop: 0,
                    color: "#fff",
                    transform: `translate(-3px,${_H}px)`
                  }}
                >
                  {match[i]._label === "unknown" ? (
                    <div>
                      <input
                        placeholder={"نام و نام خانوادگی"}
                        value={this.state.name}
                        onChange={e => {
                          this.handlechangename(e);
                        }}
                      ></input>
                      <button onClick={this.RegisterFace}>
                        ثبت مشخصات چهره
                      </button>
                    </div>
                  ) : (
                    match[i]._label
                  )}
                </p>
              ) : null}
            </div>
          </div>
        );
      });
    }

    return (
      <div>
        <input
          id="myFileUpload"
          type="file"
          onChange={this.handleFileChange}
          accept=".jpg, .jpeg, .png"
        />
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute" }}>
            <img src={imageURL} alt="imageURL" />
          </div>
          {!!drawBox ? drawBox : null}
        </div>
      </div>
    );
  }
}

export default withRouter(ImageInput);
