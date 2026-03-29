import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Set "mo:core/Set";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  // Include Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Types
  type Category = {
    #class10;
    #class11;
    #class12;
    #jee;
    #neet;
    #iitjee;
  };

  module Category {
    public func toText(category : Category) : Text {
      switch (category) {
        case (#class10) { "Class 10" };
        case (#class11) { "Class 11" };
        case (#class12) { "Class 12" };
        case (#jee) { "JEE" };
        case (#neet) { "NEET" };
        case (#iitjee) { "IIT JEE" };
      };
    };
  };

  type Note = {
    id : Nat;
    title : Text;
    subject : Text;
    description : Text;
    category : Category;
    blob : Storage.ExternalBlob;
    uploadedBy : Principal;
    createdAt : Time.Time;
  };

  module Note {
    public func compareByTitle(note1 : Note, note2 : Note) : Order.Order {
      Text.compare(note1.title, note2.title);
    };
  };

  type Bookmark = Set.Set<Nat>; // Set of note IDs

  type ReadingProgress = Map.Map<Nat, Nat>; // Note ID -> Percentage

  public type UserProfile = {
    name : Text;
  };

  // Storage
  let notes = Map.empty<Nat, Note>();
  let bookmarks = Map.empty<Principal, Bookmark>();
  let readingProgress = Map.empty<Principal, ReadingProgress>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextNoteId = 1;

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Notes management
  public shared ({ caller }) func createNote(noteData : {
    title : Text;
    subject : Text;
    description : Text;
    category : Category;
    blob : Storage.ExternalBlob;
  }) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create notes");
    };
    let id = nextNoteId;
    let note : Note = {
      id;
      title = noteData.title;
      subject = noteData.subject;
      description = noteData.description;
      category = noteData.category;
      blob = noteData.blob;
      uploadedBy = caller;
      createdAt = Time.now();
    };
    notes.add(id, note);
    nextNoteId += 1;
    id;
  };

  public shared ({ caller }) func deleteNote(noteId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete notes");
    };
    if (not notes.containsKey(noteId)) {
      Runtime.trap("Note not found");
    };
    notes.remove(noteId);
  };

  public query ({ caller }) func getNote(noteId : Nat) : async Note {
    switch (notes.get(noteId)) {
      case (null) { Runtime.trap("Note not found") };
      case (?note) { note };
    };
  };

  public query ({ caller }) func listNotes() : async [Note] {
    notes.values().toArray().sort(Note.compareByTitle);
  };

  public query ({ caller }) func filterNotesByCategory(category : Category) : async [Note] {
    notes.values().toArray().filter(
      func(n) { n.category == category }
    );
  };

  public query ({ caller }) func searchNotes(searchTerm : Text) : async [Note] {
    let lowerTerm = searchTerm.toLower();
    notes.values().toArray().filter(
      func(n) {
        n.title.toLower().contains(#text lowerTerm) or n.subject.toLower().contains(#text lowerTerm);
      }
    );
  };

  // Bookmarks
  public shared ({ caller }) func addBookmark(noteId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add bookmarks");
    };
    if (not notes.containsKey(noteId)) {
      Runtime.trap("Note not found");
    };

    switch (bookmarks.get(caller)) {
      case (null) { let userBookmarks = Set.empty<Nat>(); userBookmarks.add(noteId) };
      case (?userBookmarks) { userBookmarks.add(noteId) };
    };
  };

  public shared ({ caller }) func removeBookmark(noteId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove bookmarks");
    };
    switch (bookmarks.get(caller)) {
      case (null) {
        let userBookmarks = Set.empty<Nat>();
        userBookmarks.remove(noteId);
      };
      case (?userBookmarks) { userBookmarks.remove(noteId) };
    };
  };

  public query ({ caller }) func getBookmarks() : async [Nat] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bookmarks");
    };
    switch (bookmarks.get(caller)) {
      case (null) { [] };
      case (?b) { b.toArray() };
    };
  };

  // Reading progress
  public shared ({ caller }) func updateProgress(noteId : Nat, percentage : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update progress");
    };
    if (percentage > 100) { Runtime.trap("Percentage cannot be more than 100") };
    if (not notes.containsKey(noteId)) {
      Runtime.trap("Note not found");
    };
    switch (readingProgress.get(caller)) {
      case (null) {
        let userProgress = Map.empty<Nat, Nat>();
        userProgress.add(noteId, percentage);
      };
      case (?userProgress) { userProgress.add(noteId, percentage) };
    };
  };

  public query ({ caller }) func getProgress() : async [(Nat, Nat)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view progress");
    };
    switch (readingProgress.get(caller)) {
      case (null) { [] };
      case (?p) { p.entries().toArray() };
    };
  };
};
