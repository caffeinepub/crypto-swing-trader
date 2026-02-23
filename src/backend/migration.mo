import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Text "mo:core/Text";

module {
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
  type Preferences = {
    theme : Text;
    notifications : Bool;
  };
  type UserData = {
    portfolio : List.List<{ symbol : Text; quantity : Float }>;
    watchlist : List.List<Text>;
    journal : List.List<Trade>;
    preferences : Preferences;
  };
  type OldActor = {
    userData : Map.Map<Text, UserData>;
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
  type Alert = {
    timestamp : Int;
    crypto : Text;
    signalType : SignalType;
    triggerReason : ?TriggerReason;
    confidence : Nat;
    priceAtTrigger : Float;
  };

  type NewActor = {
    userData : Map.Map<Text, UserData>;
    alertHistories : Map.Map<Text, List.List<Alert>>;
  };

  public func run(old : OldActor) : NewActor {
    {
      userData = old.userData;
      alertHistories = Map.empty<Text, List.List<Alert>>();
    };
  };
};
