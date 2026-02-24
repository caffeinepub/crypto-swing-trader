import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";

module {
  // Old data structures
  type OldPreferences = {
    theme : Text;
    notifications : Bool;
  };

  type OldUserData = {
    portfolio : List.List<{ symbol : Text; quantity : Float }>;
    watchlist : List.List<Text>;
    journal : List.List<{
      id : Nat;
      crypto : Text;
      direction : { #long : () ; #short : () };
      entryPrice : Float;
      exitPrice : ?Float;
      quantity : Float;
      date : Text;
      rationale : Text;
      outcome : Text;
      notes : Text;
    }>;
    preferences : OldPreferences;
  };

  // Old actor state type
  type OldActor = {
    userData : Map.Map<Text, OldUserData>;
  };

  // New user data structure
  type NewUserData = {
    preferences : OldPreferences;
  };

  // New actor state type
  type NewActor = {
    userData : Map.Map<Text, NewUserData>;
  };

  public func run(old : OldActor) : NewActor {
    let newUserData = old.userData.map<Text, OldUserData, NewUserData>(
      func(_key, oldUser) {
        { preferences = oldUser.preferences };
      }
    );
    { old with userData = newUserData };
  };
};
