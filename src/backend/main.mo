import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Nat32 "mo:core/Nat32";
import OutCall "http-outcalls/outcall";
import Migration "migration";

(with migration = Migration.run)
actor {
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Types
  type Direction = { #long; #short };
  type Preferences = {
    theme : Text;
    notifications : Bool;
  };
  type UserData = {
    preferences : Preferences;
  };
  type SignalType = { #buy; #sell; #hold };
  type TriggerReason = {
    #rsiBelow30 : Text;
    #rsiAbove70 : Text;
    #macdCrossover : Text;
    #priceBreak : Text;
    #stopLoss : ?Float;
    #takeProfit : ?Float;
    #riskReward : ?Float;
    #trendFollowing : Bool;
  };

  // Now includes TriggerReason
  type Alert = {
    timestamp : Int;
    crypto : Text;
    signalType : SignalType;
    triggerReason : ?TriggerReason; // Now optional
    confidence : Nat;
    priceAtTrigger : Float;
  };

  // State
  let userData = Map.empty<Text, UserData>();
  let alertHistories = Map.empty<Text, List.List<Alert>>();

  // Helper Functions
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

  // 1. Authentication & User Management
  public shared ({ caller }) func initializeUser(preferences : Preferences) : async () {
    let id = caller.toText();
    if (userData.containsKey(id)) { Runtime.trap("User already exists") };
    let data : UserData = { preferences };
    userData.add(id, data);
    alertHistories.add(id, List.empty<Alert>());
  };

  // 2. News Aggregation (Backend handles outcall only - parsing and display done in frontend)
  public shared ({ caller }) func fetchTopCryptoNews() : async Text {
    await OutCall.httpGetRequest(
      "https://crypto-news-api.com/api/v1/top-news?category=cryptocurrency&apiKey=fakeApiKey",
      [],
      transform,
    );
  };

  // 3. Price Data Fetching (Backend handles outcall only - parsing and display done in frontend)
  public shared ({ caller }) func fetchTopCryptos() : async Text {
    await OutCall.httpGetRequest(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false",
      [],
      transform,
    );
  };

  // 4. Customization
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

  // --- 5. Alert History (New Functionality) ---
  // Persist a single alert for a user
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

  // Retrieve filtered alert history
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

  // Helper function to compare SignalTypes
  func isMatchingSignalType(a : SignalType, b : SignalType) : Bool {
    switch (a, b) {
      case (#buy, #buy) { true };
      case (#sell, #sell) { true };
      case (#hold, #hold) { true };
      case (_) { false };
    };
  };

  // Purge Old Alerts (e.g., older than 30 days)
  public shared ({ caller }) func purgeOldAlerts() : async () {
    ensureUserExists(caller);
    let thirtyDaysInNanos = 2592000000000000; // 30 days in nanoseconds

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

  // Fetch Alerts from Last 24 Hours
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

  // Get Count of Alerts by Type
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

  // Retrieve All Alerts for a Crypto
  public query ({ caller }) func getCryptoAlertHistory(crypto : Text) : async [Alert] {
    ensureUserExists(caller);
    switch (alertHistories.get(caller.toText())) {
      case (null) { [] };
      case (?alerts) {
        alerts.toArray().filter(func(a) { Text.equal(a.crypto, crypto) });
      };
    };
  };

  // Clear All Alerts Function
  public shared ({ caller }) func clearAlerts() : async () {
    ensureUserExists(caller);
    alertHistories.add(caller.toText(), List.empty<Alert>());
  };
};
