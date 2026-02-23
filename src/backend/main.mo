import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Nat32 "mo:core/Nat32";
import OutCall "http-outcalls/outcall";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Migration "migration";

(with migration = Migration.run)
actor {
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Types
  type Watchlist = List.List<Text>;
  type Position = { symbol : Text; quantity : Float };
  type Portfolio = List.List<Position>;
  type Direction = { #long; #short };
  type Trade = {
    id : Nat;
    crypto : Text;
    direction : Direction;
    entryPrice : Float;
    exitPrice : ?Float;
    quantity : Float;
    date : Text;
    rationale : Text;
    outcome : Text;
    notes : Text;
  };
  type Journal = List.List<Trade>;

  type Preferences = {
    theme : Text;
    notifications : Bool;
  };
  type Advanced = {
    leverage : Float;
    margin : Float;
    riskReward : Float;
    stopLoss : Float;
    takeProfit : Float;
  };
  type UserData = {
    portfolio : Portfolio;
    watchlist : Watchlist;
    journal : Journal;
    preferences : Preferences;
  };
  type Crypto = {
    symbol : Text;
    name : Text;
    price : Float;
    change24h : Float;
    volume24h : Float;
    marketCap : Float;
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

  module Position {
    public func compare(position1 : Position, position2 : Position) : Order.Order {
      Text.compare(position1.symbol, position2.symbol);
    };
  };

  // 1. Authentication & User Management
  public shared ({ caller }) func initializeUser(preferences : Preferences) : async () {
    let id = caller.toText();
    if (userData.containsKey(id)) { Runtime.trap("User already exists") };
    let data : UserData = {
      portfolio = List.empty();
      watchlist = List.empty();
      journal = List.empty();
      preferences;
    };
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

  // 4. Position Management
  public shared ({ caller }) func addPosition(symbol : Text, quantity : Float) : async () {
    ensureUserExists(caller);
    switch (getUserData(caller)) {
      case (null) { Runtime.trap("User data not found after existence check") };
      case (?data) {
        let newPosition = { symbol; quantity };
        data.portfolio.add(newPosition);
        let updatedData : UserData = {
          portfolio = data.portfolio;
          watchlist = data.watchlist;
          journal = data.journal;
          preferences = data.preferences;
        };
        userData.add(caller.toText(), updatedData);
      };
    };
  };

  public shared ({ caller }) func removePosition(symbol : Text) : async () {
    ensureUserExists(caller);
    let updatedPortfolio = switch (getUserData(caller)) {
      case (null) { Runtime.trap("User data not found after existence check") };
      case (?data) {
        data.portfolio.filter(
          func(p) {
            not Text.equal(p.symbol, symbol);
          }
        );
      };
    };
    switch (getUserData(caller)) {
      case (null) { Runtime.trap("User data not found after existence check") };
      case (?data) {
        let updatedData : UserData = {
          portfolio = updatedPortfolio;
          watchlist = data.watchlist;
          journal = data.journal;
          preferences = data.preferences;
        };
        userData.add(caller.toText(), updatedData);
      };
    };
  };

  public query ({ caller }) func getPortfolio() : async [Position] {
    ensureUserExists(caller);
    switch (getUserData(caller)) {
      case (null) { Runtime.trap("User data not found after existence check") };
      case (?data) { data.portfolio.toArray().sort() };
    };
  };

  // 5. Watchlist Management
  public shared ({ caller }) func addToWatchlist(coin : Text) : async () {
    ensureUserExists(caller);
    switch (getUserData(caller)) {
      case (null) { Runtime.trap("User data not found after existence check") };
      case (?data) {
        if (data.watchlist.any(func(c) { Text.equal(c, coin) })) {
          Runtime.trap("Coin already in watchlist");
        };
        data.watchlist.add(coin);
        let updatedData : UserData = {
          watchlist = data.watchlist;
          portfolio = data.portfolio;
          journal = data.journal;
          preferences = data.preferences;
        };
        userData.add(caller.toText(), updatedData);
      };
    };
  };

  public shared ({ caller }) func removeFromWatchlist(coin : Text) : async () {
    ensureUserExists(caller);
    let updatedWatchList = switch (getUserData(caller)) {
      case (null) { Runtime.trap("User data not found after existence check") };
      case (?data) {
        data.watchlist.filter(
          func(c) { not Text.equal(c, coin) }
        );
      };
    };
    switch (getUserData(caller)) {
      case (null) { Runtime.trap("User data not found after existence check") };
      case (?data) {
        let updatedData : UserData = {
          watchlist = updatedWatchList;
          portfolio = data.portfolio;
          journal = data.journal;
          preferences = data.preferences;
        };
        userData.add(caller.toText(), updatedData);
      };
    };
  };

  public query ({ caller }) func getWatchlist() : async [Text] {
    ensureUserExists(caller);
    switch (getUserData(caller)) {
      case (null) { Runtime.trap("User data not found after existence check") };
      case (?data) { data.watchlist.toArray() };
    };
  };

  // 6. Trading Journal
  public shared ({ caller }) func addTrade(trade : Trade) : async () {
    ensureUserExists(caller);
    if (trade.crypto.isEmpty()) { Runtime.trap("Crypto cannot be empty") };
    if (trade.quantity <= 0) { Runtime.trap("Quantity must be greater than 0") };

    let newTrade = { trade with id = trade.id };
    switch (getUserData(caller)) {
      case (null) { Runtime.trap("User data not found after existence check") };
      case (?data) {
        data.journal.add(newTrade);
        let updatedData : UserData = {
          journal = data.journal;
          portfolio = data.portfolio;
          watchlist = data.watchlist;
          preferences = data.preferences;
        };
        userData.add(caller.toText(), updatedData);
      };
    };
  };

  public query ({ caller }) func getJournal() : async [Trade] {
    ensureUserExists(caller);
    switch (getUserData(caller)) {
      case (null) { Runtime.trap("User data not found after existence check") };
      case (?data) { data.journal.toArray() };
    };
  };

  public shared ({ caller }) func removeFromJournal(tradeId : Nat) : async () {
    ensureUserExists(caller);
    let updatedJournal = switch (getUserData(caller)) {
      case (null) { Runtime.trap("User data not found after existence check") };
      case (?data) {
        data.journal.filter(
          func(t) { t.id != tradeId }
        );
      };
    };
    switch (getUserData(caller)) {
      case (null) { Runtime.trap("User data not found after existence check") };
      case (?data) {
        let updatedData : UserData = {
          journal = updatedJournal;
          portfolio = data.portfolio;
          watchlist = data.watchlist;
          preferences = data.preferences;
        };
        userData.add(caller.toText(), updatedData);
      };
    };
  };

  // 7. Customization
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
        let updatedData : UserData = {
          portfolio = data.portfolio;
          watchlist = data.watchlist;
          journal = data.journal;
          preferences = newPreferences;
        };
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

  // --- 8. Alert History (New Functionality) ---
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
