import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { User } from '../models/user';
import { QuestionnaireService } from './../services/questionnaire.service'
import html2canvas from 'html2canvas';
import { environment } from 'src/environments/environment';
// import { Options } from '@m0t0r/ngx-slider';
import { Options } from 'ng5-slider';
declare var Slider: any;



@Component({
  selector: 'app-mbai-body',
  templateUrl: './mbai-body.component.html',
  styleUrls: ['./mbai-body.component.scss']
})
export class MbaiBodyComponent implements OnInit {

  title = 'mHealthMobile';
  isSubmitted = false;
  public userInputs: User = new User();
  errorCorrectionLevel = 'M'
  public myAngularxQrCode: string = null;
  public qrCodeScanner: boolean = false;
  public qrCodeCleared: boolean = false;
  value: number;
  options: Options = {
    showTicksValues: true,
    stepsArray: [
      { value: 0, legend: 'Not Comfortable' },
      { value: 1},
      { value: 2 },
      { value: 3 },
      { value: 4 },
      { value: 5 },
      { value: 6 },
      { value: 7 },
      { value: 8 },
      { value: 9 },
      { value: 10, legend: 'Comfortable' }
    ]
  };
  questionire = {
    "ques1": "Have You Tested Positive Or Otherwise Been Diagnosed With COVID-19? ",
    "ques2": "Have You Been Tested For COVID-19 And Are Awaiting Your Tested Results?",
    "ques3": "Have You Had Any of These Symptoms In The Past 14 Days (SOURCE : CDC)? FEVER, COUGH, SHORTNESS OF BREATH, CHILLS,MUSCLE ACHE, LOSS OF SMELL OR TASTE, HEADACHE OR SORE THROAT",
    "ques4": "Have You Been In Contact With Anyone Displaying COVID-19 Symptoms Or Confirmed To Be COVID-19 Positive Within The Last 14 Days?",
    "ques5": "Do you agree to abide by Nike's safety precautions including but not limited to social distancing, wearing face coverings and hand sanitizing?",
  }
  locations: any[] = [];
  @ViewChild('screen') screen: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('downloadLink') downloadLink: ElementRef;
  istTime: any;
  min = 0;
  max = 10;
  @ViewChild('myRange')
  myRange: ElementRef;
  qrData: any;
  qrDataToDisplay: string;
  error: boolean = false;
  constructor(private queSer: QuestionnaireService
  ) {
  }
  ngOnInit() {
    // this.userInputs.rating = 5;
    this.getLocations();
  }
  sliderRange(eve) {
    console.log(eve);
    this.userInputs.rating = eve.target.value
  }
  onSubmit() {
    this.isSubmitted = true;
    console.log('SUCCESS!!', this.userInputs);
    let date = new Date();
    let dateTime = new Date(new Date(date).getTime() + 60 * 60 * 24 * 1000);
    let shortTimeZone = this.tzAbbr(dateTime);

    var req = {
      "accountId": environment.accountId,
      "locationId": this.userInputs.locationId,
      "firstName": this.userInputs.firstName,
      "lastName": this.userInputs.lastName,
      "phoneNumber": this.userInputs.phoneNumber,
      "rating": this.userInputs.rating,
      "suggestions": this.userInputs.suggestions,
      //"userTimeZone": dateTime.toString()
    };
    let questionResponse = [];
    Object.keys(this.questionire).forEach(q => {
      let obj = {
        "question": this.questionire[q],
        "response": this.userInputs[q]
      }
      questionResponse.push(obj)
    });
    req["questionResponse"] = questionResponse;
    console.log(req);

    this.queSer.saveQuestionaire(req).subscribe((res: any) => {
      if (res.statusCode != 500) {
        console.log(res);
        this.qrData = res;

        // var actualDate = new Date(this.qrData.validity);
        // var  convertedDate = new Date(Date.UTC(actualDate.getFullYear(), actualDate.getMonth(), actualDate.getDate(), actualDate.getHours(), actualDate.getMinutes(), actualDate.getSeconds()))
        // var convertedToBrowserDate = convertedDate.toLocaleString() + ' ' + this.tzAbbr(convertedDate);
        this.qrData.validity = dateTime.toLocaleString() + ' ' + shortTimeZone;
        let status = this.qrData.isCleared ? 'Cleared' : 'Not Cleared'
        this.qrDataToDisplay = 'Employee Name : ' + this.qrData.employeeName + ', \n' + 'Status : ' + status + ', \n' + 'Valid till : ' + this.qrData.validity;
        this.qrCodeScanner = true
      } else {
        this.qrCodeScanner = false;
      }

    })
    // document.write("<b>" + hoursIST + ":" + minutesIST + " " + "</b>")
  }

  // getLocations() {
  //     if (localStorage.getItem('locations')) {
  //       this.locations = JSON.parse(localStorage.getItem('locations'));
  //       console.log(this.locations);

  //       this.userInputs.locationId = this.locations.length > 0 ? this.locations[0].id : undefined;
  //     } else {
  //       this.locations = [];
  //     }

  // }

  getLocations() {
    // if (localStorage.getItem('locations')) {
    //   this.locations = JSON.parse(localStorage.getItem('locations'));
    //   console.log(this.locations);

    //   this.userInputs.locationId = this.locations.length > 0 ? this.locations[0].id : undefined;
    // } else {
    //   this.locations = [];
    // }

    this.queSer.getLocations().subscribe((res: any) => {
      if (res.status != 'Failure') {

        // localStorage.setItem('locations',JSON.stringify(res))
        this.locations = res; //JSON.parse(localStorage.getItem('locations'));
        console.log(this.locations);
        this.userInputs.locationId = this.locations.length > 0 ? this.locations[0].id : undefined;

      } else {
        this.error = true;
        this.locations = [];
        //this.toaster.error(res.message, 'Error')
      }
    })

  }

  // downloadpng(){
  //   html2canvas(this.screen.nativeElement).then(canvas => {
  //     this.canvas.nativeElement.src = canvas.toDataURL();
  //     this.downloadLink.nativeElement.href = canvas.toDataURL('image/png');
  //     this.downloadLink.nativeElement.download = 'MBAI-Qr-scan.png';
  //     this.downloadLink.nativeElement.click();
  //   });
  // }
  downloadjpg() {
    html2canvas(this.screen.nativeElement).then(canvas => {
      this.canvas.nativeElement.src = canvas.toDataURL();
      this.downloadLink.nativeElement.href = canvas.toDataURL('image/jpeg');
      this.downloadLink.nativeElement.download = 'MBAI-Qr-scan';
      this.downloadLink.nativeElement.click();
    });
  }

  tzAbbr(dateInput) {
    var dateObject = dateInput || new Date(),
      dateString = dateObject + "",
      tzAbbr: any = (
        // Works for the majority of modern browsers
        dateString.match(/\(([^\)]+)\)$/) ||
        // IE outputs date strings in a different format:
        dateString.match(/([A-Z]+) [\d]{4}$/)
      );

    if (tzAbbr) {
      // Old Firefox uses the long timezone name (e.g., "Central
      // Daylight Time" instead of "CDT")
      tzAbbr = tzAbbr[1].match(/[A-Z]/g).join("");
    }

    return tzAbbr;
  };


}


  //   this.questionire = [
  //   {"quesValue" : this.userInputs.ques1},{"quesValue" : this.userInputs.ques2},
  //   {"quesValue" : this.userInputs.ques2},{"quesValue" : this.userInputs.ques4}
  // ]
