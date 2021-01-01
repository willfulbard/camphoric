import React from 'react';
import { IChangeEvent, UiSchema } from '@rjsf/core';
import Form from '@rjsf/core';
import { JSONSchema7 } from 'json-schema';
import { RouteComponentProps, withRouter } from 'react-router';
import { Container, Row, Col } from 'react-bootstrap';

import Spinner from '../Spinner';

import PhoneInput from 'react-phone-number-input';
import DescriptionField from '../DescriptionField';
import ObjectFieldTemplate from '../ObjectFieldTemplate';
import NaturalNumberInput from '../NaturalNumberInput';
import PriceTicker from '../PriceTicker';
import { calculatePrice, PricingResults } from './utils';

import 'react-phone-number-input/style.css';
import './RegisterPage.scss';

type PathParams = {
    eventId: string;
}

type Props = RouteComponentProps<PathParams>;

export type PricingLogic = Array<{
  label?: string;
  var: string;
  exp: any; // JsonLogic
}>;

export type RegistrationConfig = {
  dataSchema: JSONSchema7;
  uiSchema: UiSchema;
  event: { [key: string]: any };
  pricingLogic: {
    camper: PricingLogic;
    registration: PricingLogic;
  };
  pricing: { [key: string]: any };
};

export type FormData = {
  [key: string]: any;
  campers: Array<Object>;
};

interface FormDataState {
  config: RegistrationConfig;
  formData: FormData;
  totals: PricingResults;
}

interface FetchingState {
  status: "fetching";
}

interface LoadedState extends FormDataState {
  status: "loaded";
}

interface SubmittingState extends FormDataState {
  status: "submitting";
}

interface SubmittedState extends FormDataState {
  status: "submitted";
}

interface SubmissionErrorState extends FormDataState {
  status: "submissionError";
}

export type RegistrationState =
  | FetchingState
  | LoadedState
  | SubmittingState
  | SubmittedState
  | SubmissionErrorState;

// TODO(evinism): Make this better typed
const widgetMap: any = {
  PhoneInput: (props: any) => (
    <PhoneInput
      defaultCountry="US"
      value={props.value}
      onChange={(value: string) => props.onChange(value)}
    />
  ),
  NaturalNumberInput: (props: any) => (
    <NaturalNumberInput
      value={props.value}
      onChange={(value: string) => props.onChange(value)}
    />
  )
};

class App extends React.Component<Props, RegistrationState> {
  state: RegistrationState = {
    status: "fetching"
  };

  constructor(props: Props) {
    super(props);

    this.getConfig();
  }

  componentDidUpdate(prevProps: Props, prevState: RegistrationState) {
    if (this.state.status === "fetching" || prevState.status === "fetching") {
      return;
    }

    if (this.state.formData.campers.length !== prevState.formData.campers.length) {
      this.populateDescriptionsWithPrices(this.state.config);
    }
  }

  onSubmit = async ({ formData }: any) => {
    this.setState({ status: "submitting" });
    try {
      const res = await fetch(`/api/events/${this.props.match.params.eventId}/register`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          pricingResults: this.state.status === "fetching"
            ? {}
            : this.state.totals,
        }),
      });
      const text = await res.text();
      console.log("response", res.status, text);
      this.setState({ status: "submitted" });
    } catch {
      this.setState({ status: "submissionError" });
    }
  };

  getConfig = async () => {
    let config: RegistrationConfig;

    try {
      const res = await fetch(`/api/events/${this.props.match.params.eventId}/register`);
      config = await res.json();
    } catch (e) {
      console.error(e);
      return;
    }

    this.setState({
      status: "loaded",
      config,
      formData: { campers: [{}] },
      totals: { campers: [] },
    });

    this.populateDescriptionsWithPrices(config);
  };

  populateDescriptionsWithPrices(config: RegistrationConfig) {
    // Because of the way that react-jsonschema-form works, this is the
    // simplest way to "templatify" the pricing
    Object.keys(config.pricing).forEach(key => {
      const price = config.pricing[key];

      const els = document.getElementsByClassName("pricing_" + key);

      for (let i = 0; i < els.length; i++) {
        els[i].innerHTML = "$" + Math.abs(price);
      }
    });
  }

  onChange = ({ formData }: IChangeEvent<FormData>) => {
    if (this.state.status === "fetching") {
      return;
    }
    
    this.setState(({ 
      formData,
      totals: calculatePrice(this.state.config, formData),
    }) as LoadedState);
  };

  transformErrors = (errors: Array<any>) =>
    errors.map(error => {
      if (error.name === "pattern" && error.property === ".payer_number") {
        return {
          ...error,
          message: "Please enter a valid phone number"
        };
      }

      return error;
    });

  render() {
    let pageContent: JSX.Element;
    switch (this.state.status) {
      case "loaded":
      case "submitting":
        pageContent = (
          <section>
            <Form
              schema={this.state.config.dataSchema}
              uiSchema={this.state.config.uiSchema}
              widgets={widgetMap}
              fields={{ DescriptionField: DescriptionField }}
              ObjectFieldTemplate={ObjectFieldTemplate}
              onChange={this.onChange}
              onSubmit={this.onSubmit}
              onError={() => console.log("errors")}
              formData={this.state.formData}
              transformErrors={this.transformErrors}
              // liveValidate={true}
            >
              <div>
                <p>
                  By submitting this form, you agree to the{" "}
                  <a
                    href="http://www.larkcamp.org/campterms.html"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Terms of Registration
                  </a>
                  .
                </p>
                <button type="submit" className="btn btn-info">
                  Submit Registration
                </button>
              </div>
            </Form>
            <PriceTicker price={this.state.totals.total || 0} />
          </section>
        );
        break;
      case "submitted":
        pageContent = (
          <section className="reciept">
            <h1>You're all set!</h1>
            <h2>See you at Lark Camp 2020!</h2>
            <p>
              {" "}
              If you're paying by PayPal or credit card, we'll be sending you a
              confirmation with payment instructions within the next week. If
              you're paying by check, please make it for{" "}
              <strong> ${this.state.totals.total} </strong>
              payable to "Lark Camp", and mail it to:{" "}
            </p>

            <address>
              {" "}
              Lark Camp
              <br /> PO Box 1724
              <br /> Mendocino, CA 95460
              <br /> USA{" "}
            </address>

            <p>
              Do you need approval for your vehicle or trailer, have questions
              about carpooling, payments, meals, ordering t-shirts, or anything
              else? Email us at
              <a href="mailto: registration@larkcamp.org">
                {" "}
                registration@larkcamp.org{" "}
              </a>
              or call 707-397-5275.
            </p>

            <a href="https://www.larkcamp.org">
              Visit our website at www.larkcamp.org for more information!
            </a>
          </section>
        );
        break;
      default:
        pageContent = <Spinner />;
    }

    return (
      <Container><Row className="justify-content-md-center"><Col className="RegisterPage">
        {pageContent}
      </Col></Row></Container>
    );
  }
}

export default withRouter(App);
