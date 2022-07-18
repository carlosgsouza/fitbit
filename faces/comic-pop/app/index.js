import clock from "clock";
import { display } from "display";
import * as document from "document";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import { me as appbit } from "appbit";
import { today } from "user-activity";
import { HeartRateSensor } from "heart-rate";


clock.granularity = "minutes";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEK_DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATS_MODES = ["calories", "heartRate", "steps", "distance", "activeZoneMinutes"];
class Stats {
  constructor() {
    this.statsLabel = new ShadowedLabel("stats");
    this.statsIcon = new ShadowedIcon("stats");
    
    this.currentStatsIndex = 0;
    
    this.heartRateSensor = new HeartRateSensor();
    this.heartRateSensor.addEventListener("reading", () => {
      if(this.getMode() === "heartRate") {
        this.refresh();  
      }
    });
    this.heartRateSensor.start();
  }
  
  refresh() {
    this.statsIcon.setIcon(`${this.getMode()}.png`);
    this.statsLabel.setText(this.getValue());
  }
  
  getMode() {
    return STATS_MODES[this.currentStatsIndex];
  }
  
  getValue() {
    switch(this.getMode()) {
      case "calories":
      case "steps":
      case "distance":
        return today.adjusted[this.getMode()];
      case "heartRate":
        return `  ${this.heartRateSensor.heartRate}`;
      case "activeZoneMinutes":
        return `  ${today.adjusted.activeZoneMinutes.total}`;
      default:
        throw `Unkown mode: ${this.getMode()}`;
    }
  }
  
  toggleMode() {
    this.currentStatsIndex = (this.currentStatsIndex + 1) % STATS_MODES.length;
  }
}

class ShadowedLabel {
  constructor(labelName) {
    this.mainLabel = document.getElementById(`${labelName}LabelMain`);
    this.shadowLabel = document.getElementById(`${labelName}LabelShadow`);  
  }
  
  setText(text) {
    this.mainLabel.text = text;
    this.shadowLabel.text = text;
  }
}

class ShadowedIcon {
  constructor(imageName) {
    this.mainIcon = document.getElementById(`${imageName}IconMain`);
    this.shadowIcon = document.getElementById(`${imageName}IconShadow`);
  }
  
  setIcon(fileName) {
    this.mainIcon.href = fileName;
    this.shadowIcon.href = fileName;
  }
}

class Watch {
  constructor() {    
    this.timeLabel = new ShadowedLabel("time");
    this.dateLabel = new ShadowedLabel("date");
    
    this.stats = new Stats();
  }
  
  ontick(evt) {
    this.timeLabel.setText(this.getFormatedTime(evt.date));
    this.dateLabel.setText(this.getFormatedDate(evt.date));
    
    this.stats.refresh();
  }
  
  onclick(evt) {
    this.stats.toggleMode();
    this.stats.refresh();
  }
  
  getFormatedTime(date) {
    let hours = date.getHours();
    if (preferences.clockDisplay === "12h") {
      hours = hours % 12 || 12;
    }
    hours = util.zeroPad(hours);
    
    let mins = util.zeroPad(date.getMinutes());    
    
    return `${hours}:${mins}`
  }
  
  getFormatedDate(date) {
    let weekDay = WEEK_DAY_NAMES[date.getDay()];
    let day = util.zeroPad(date.getDate());
    
    return `${weekDay} ${day}`;
  }
}

const watch = new Watch();

clock.ontick = (evt) => {
  watch.ontick(evt)
}

document.getElementById("clock").addEventListener("click", (evt) => {
  watch.onclick(evt)
});

