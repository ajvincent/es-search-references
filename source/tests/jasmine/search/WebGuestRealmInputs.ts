import { SearchLogsConfiguration } from "../../../scripts/search/LoggingConfiguration.js";
import {
  WebGuestRealmInputs
} from "../../../scripts/search/WebGuestRealmInputs.js";

describe("WebGuestRealmInputs", () => {
  void WebGuestRealmInputs;

  it(".resolveSpecifier returns correct values from URL's", () => {
    const config = new SearchLogsConfiguration;
    const inputs = new WebGuestRealmInputs("virtual://one/two/three.js", new Map, config);
    const three_js = "virtual://one/two/three.js";
    expect(
      inputs.resolveSpecifier("es-search-references/guest", three_js)
    ).withContext("package").toBe("es-search-references/guest");

    expect(
      inputs.resolveSpecifier("simulated://nine/ten.js", three_js)
    ).withContext("simulated://nine/ten.js").toBe("simulated://nine/ten.js");

    expect(
      inputs.resolveSpecifier("./four.js", three_js)
    ).withContext("./four.js").toBe("virtual://one/two/four.js");

    expect(
      inputs.resolveSpecifier("./four/five.js", three_js)
    ).withContext("./four/five.js").toBe("virtual://one/two/four/five.js");

    expect(
      inputs.resolveSpecifier("../six.js", three_js)
    ).withContext("../six.js").toBe("virtual://one/six.js");

    expect(
      inputs.resolveSpecifier("../seven/eight.js", three_js)
    ).withContext("../seven/eight.js").toBe("virtual://one/seven/eight.js");
  });

  it(".resolveSpecifier only goes so many levels up in a URL", () => {
    const config = new SearchLogsConfiguration;
    const inputs = new WebGuestRealmInputs("virtual://one/two/three.js", new Map, config);
    const three_js = "virtual://one/two/three.js";

    expect(
      inputs.resolveSpecifier("../seven/eight.js", three_js)
    ).withContext("../../seven/eight.js").toBe("virtual://one/seven/eight.js");
  });

  it(".resolveSpecifier returns correct values from packages", () => {
    const config = new SearchLogsConfiguration;
    const inputs = new WebGuestRealmInputs("one/two/three.js", new Map, config);
    const three_js = "one/two/three.js";
    expect(
      inputs.resolveSpecifier("es-search-references/guest", three_js)
    ).withContext("package").toBe("es-search-references/guest");

    expect(
      inputs.resolveSpecifier("simulated://nine/ten.js", three_js)
    ).withContext("simulated://nine/ten.js").toBe("simulated://nine/ten.js");

    expect(
      inputs.resolveSpecifier("./four.js", three_js)
    ).withContext("./four.js").toBe("one/two/four.js");

    expect(
      inputs.resolveSpecifier("./four/five.js", three_js)
    ).withContext("./four/five.js").toBe("one/two/four/five.js");

    expect(
      inputs.resolveSpecifier("../six.js", three_js)
    ).withContext("../six.js").toBe("one/six.js");

    expect(
      inputs.resolveSpecifier("../seven/eight.js", three_js)
    ).withContext("../seven/eight.js").toBe("one/seven/eight.js");
  });
});
