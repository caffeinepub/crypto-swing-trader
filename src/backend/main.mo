import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import OutCall "http-outcalls/outcall";



actor {
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public type Preferences = { theme : Text; notifications : Bool };
  public type UserData = { preferences : Preferences };
  public type Direction = { #long; #short };
  public type SignalType = { #buy; #sell; #hold };
  public type TriggerReason = {
    #rsiBelow30 : Text;
    #rsiAbove70 : Text;
    #macdCrossover : Text;
    #priceBreak : Text;
    #stopLoss : ?Float;
    #takeProfit : ?Float;
    #riskReward : ?Float;
    #trendFollowing : Bool;
  };

  public type PriceDirection = { #above; #below };

  public type Alert = {
    timestamp : Int;
    crypto : Text;
    signalType : SignalType;
    triggerReason : ?TriggerReason;
    confidence : Nat;
    priceAtTrigger : Float;
  };

  public type PriceTarget = {
    id : Text;
    coinId : Text;
    coinName : Text;
    targetPrice : Float;
    direction : PriceDirection;
    createdAt : Int;
    triggered : Bool;
  };

  let userData = Map.empty<Text, UserData>();
  let alertHistories = Map.empty<Text, List.List<Alert>>();
  let priceTargets = Map.empty<Text, List.List<PriceTarget>>();

  func getUserData(caller : Principal) : ?UserData {
    let id = caller.toText();
    userData.get(id);
  };

  func ensureUserExists(caller : Principal) {
    switch (getUserData(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?_) {};
    };
  };

  public shared ({ caller }) func initializeUser(preferences : Preferences) : async () {
    let id = caller.toText();
    if (userData.containsKey(id)) { Runtime.trap("User already exists") };
    let data : UserData = { preferences };
    userData.add(id, data);
    alertHistories.add(id, List.empty<Alert>());
    priceTargets.add(id, List.empty<PriceTarget>());
  };

  public shared ({ caller }) func fetchTopCryptoNews() : async Text {
    await OutCall.httpGetRequest(
      "https://crypto-news-api.com/api/v1/top-news?category=cryptocurrency&apiKey=fakeApiKey",
      [],
      transform,
    );
  };

  public shared ({ caller }) func fetchTopCryptos() : async Text {
    await OutCall.httpGetRequest(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false",
      [],
      transform,
    );
  };

  public shared ({ caller }) func updateTheme(theme : Text) : async () {
    ensureUserExists(caller);
    if (not (Text.equal(theme, "dark") or Text.equal(theme, "light"))) {
      Runtime.trap("Invalid theme. Must be 'dark' or 'light'");
    };

    switch (getUserData(caller)) {
      case (null) { Runtime.trap("User data not found after existence check") };
      case (?data) {
        let newPreferences : Preferences = {
          theme;
          notifications = data.preferences.notifications;
        };
        let updatedData : UserData = { preferences = newPreferences };
        userData.add(caller.toText(), updatedData);
      };
    };
  };

  public query ({ caller }) func getTheme() : async Text {
    ensureUserExists(caller);
    switch (getUserData(caller)) {
      case (null) { Runtime.trap("User data not found after existence check") };
      case (?data) { data.preferences.theme };
    };
  };

  public shared ({ caller }) func saveAlert(crypto : Text, signalType : SignalType, triggerReason : ?TriggerReason, confidence : Nat, priceAtTrigger : Float) : async () {
    ensureUserExists(caller);
    let currentTime = Time.now();

    let newAlert : Alert = {
      timestamp = currentTime;
      crypto;
      signalType;
      triggerReason;
      confidence;
      priceAtTrigger;
    };

    let currentHistory = switch (alertHistories.get(caller.toText())) {
      case (null) { List.empty<Alert>() };
      case (?history) { history };
    };

    currentHistory.add(newAlert);
    alertHistories.add(caller.toText(), currentHistory);
  };

  public query ({ caller }) func getAlertHistory(filterCrypto : ?Text, filterSignal : ?SignalType) : async [Alert] {
    ensureUserExists(caller);
    switch (alertHistories.get(caller.toText())) {
      case (null) { [] };
      case (?alerts) {
        alerts.toArray().filter(func(alert) {
          var cryptoMatch = true;
          var signalMatch = true;

          switch (filterCrypto) {
            case (?crypto) {
              cryptoMatch := Text.equal(alert.crypto, crypto);
            };
            case (null) { cryptoMatch := true };
          };

          switch (filterSignal) {
            case (?signal) { signalMatch := isMatchingSignalType(alert.signalType, signal) };
            case (null) { signalMatch := true };
          };

          cryptoMatch and signalMatch;
        });
      };
    };
  };

  func isMatchingSignalType(a : SignalType, b : SignalType) : Bool {
    switch (a, b) {
      case (#buy, #buy) { true };
      case (#sell, #sell) { true };
      case (#hold, #hold) { true };
      case (_) { false };
    };
  };

  public shared ({ caller }) func purgeOldAlerts() : async () {
    ensureUserExists(caller);
    let thirtyDaysInNanos = 2592000000000000;

    let currentTime = Time.now();
    let currentHistory = switch (alertHistories.get(caller.toText())) {
      case (null) { List.empty<Alert>() };
      case (?history) { history };
    };

    let filteredHistory = currentHistory.filter(
      func(a) { (currentTime - a.timestamp) <= thirtyDaysInNanos }
    );
    alertHistories.add(caller.toText(), filteredHistory);
  };

  public query ({ caller }) func getAlertsLast24Hours() : async [Alert] {
    ensureUserExists(caller);
    let dayInNanos = 86400000000000;
    let currentTime = Time.now();

    switch (alertHistories.get(caller.toText())) {
      case (null) { [] };
      case (?alerts) {
        alerts.toArray().filter(
          func(a) { (currentTime - a.timestamp) <= dayInNanos }
        );
      };
    };
  };

  public query ({ caller }) func getAlertStats() : async (Nat, Nat, Nat) {
    ensureUserExists(caller);
    var buyCount = 0 : Nat;
    var sellCount = 0 : Nat;
    var holdCount = 0 : Nat;

    switch (alertHistories.get(caller.toText())) {
      case (null) { (0, 0, 0) };
      case (?alerts) {
        switch (alertHistories.get(caller.toText())) {
          case (null) {};
          case (?alerts) {
            alerts.toArray().forEach(
              func(a) {
                switch (a.signalType) {
                  case (#buy) { buyCount += 1 };
                  case (#sell) { sellCount += 1 };
                  case (#hold) { holdCount += 1 };
                };
              }
            );
          };
        };
        (buyCount, sellCount, holdCount);
      };
    };
  };

  public query ({ caller }) func getCryptoAlertHistory(crypto : Text) : async [Alert] {
    ensureUserExists(caller);
    switch (alertHistories.get(caller.toText())) {
      case (null) { [] };
      case (?alerts) {
        alerts.toArray().filter(func(a) { Text.equal(a.crypto, crypto) });
      };
    };
  };

  public shared ({ caller }) func clearAlerts() : async () {
    ensureUserExists(caller);
    alertHistories.add(caller.toText(), List.empty<Alert>());
  };

  public shared ({ caller }) func addPriceTarget(coinId : Text, coinName : Text, targetPrice : Float, direction : PriceDirection) : async Text {
    ensureUserExists(caller);
    let id = Time.now().toText() # coinId;
    let newTarget : PriceTarget = {
      id;
      coinId;
      coinName;
      targetPrice;
      direction;
      createdAt = Time.now();
      triggered = false;
    };

    let currentTargets = switch (priceTargets.get(caller.toText())) {
      case (null) { List.empty<PriceTarget>() };
      case (?targets) { targets };
    };

    currentTargets.add(newTarget);
    priceTargets.add(caller.toText(), currentTargets);
    id;
  };

  public query ({ caller }) func getPriceTargets() : async [PriceTarget] {
    ensureUserExists(caller);
    switch (priceTargets.get(caller.toText())) {
      case (null) { [] };
      case (?targets) {
        targets.toArray();
      };
    };
  };

  public shared ({ caller }) func deletePriceTarget(id : Text) : async () {
    ensureUserExists(caller);
    switch (priceTargets.get(caller.toText())) {
      case (null) { Runtime.trap("Price target not found") };
      case (?targets) {
        let filteredTargets = targets.filter(
          func(target) { not Text.equal(target.id, id) }
        );
        priceTargets.add(caller.toText(), filteredTargets);
      };
    };
  };

  public shared ({ caller }) func markPriceTargetTriggered(id : Text) : async () {
    ensureUserExists(caller);
    switch (priceTargets.get(caller.toText())) {
      case (null) { Runtime.trap("Price target not found") };
      case (?targets) {
        let updatedTargets = targets.map<PriceTarget, PriceTarget>(
          func(target) {
            if (Text.equal(target.id, id)) {
              { target with triggered = true };
            } else { target };
          }
        );
        priceTargets.add(caller.toText(), updatedTargets);
      };
    };
  };
};
