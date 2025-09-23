import { UserEntity } from "@/core/domain/entities/user.domain.entity";
import { IUserRepository } from "@/core/application/interfaces/auth/user.app.inter";
import { FirebaseClientProvider } from "../providers/firebase/firebase-client";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { FirebaseAdminProvider } from "../providers/firebase/firebase-admin";
import {
  TCreateUserDto,
  TUserOutputRequestDto,
  TUpdateUserDto,
} from "@/core/application/dtos/user.app.dto";

export class UserInfraRepository implements IUserRepository {
  constructor(
    private firebaseAdmin: FirebaseAdminProvider,
    private firebaseClient: FirebaseClientProvider
  ) {}
  async create(data: TCreateUserDto): Promise<string> {
    try {
      // Create user auth in Firebase Auth
      const userRecord = await this.firebaseAdmin.auth.createUser({
        email: data.email,
        password: data.password,
      });

      const db = this.firebaseClient.getDb();
      const userCollection = collection(db, "users");
      const userRef = doc(userCollection, userRecord.uid);
      return userRecord.uid;
    } catch (error) {
      console.error(error);
      throw new Error("Error creating user");
    }
  }

  async update(id: string, data: TUpdateUserDto): Promise<void> {
    try {
      // Update user auth in Firebase Auth
      if (data.email || data.password) {
        const user = await this.findById(id);
        if (!user) {
          throw new Error("User not found");
        }
        await this.firebaseAdmin.auth.updateUser(user.id, {
          email: data.email,
          password: data.password,
        });
      }

      // Update user data in Firestore
      const db = this.firebaseClient.getDb();
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date(),
      });

      // Return updated user
      const updatedUser = await this.findById(id);
      if (!updatedUser) {
        throw new Error("User not found after update");
      }
    } catch (error) {
      console.error(error);
      throw new Error("Error updating user");
    }
  }
  async delete(id: string): Promise<void> {
    try {
      // Delete user auth in Firebase Auth
      await this.firebaseAdmin.auth.deleteUser(id);
      // Delete user data in Firestore permanently
      await this.firebaseAdmin.db.collection("users").doc(id).delete();
    } catch (error) {
      console.error(error);
      throw new Error("Error deleting user");
    }
  }
  async findAll(): Promise<TUserOutputRequestDto[]> {
    try {
      const db = this.firebaseClient.getDb();
      const userCollection = collection(db, "users");
      const userSnapshot = await getDocs(userCollection);
      const users: TUserOutputRequestDto[] = [];
      userSnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as TUserOutputRequestDto);
      });
      return users;
    } catch (error) {
      console.error(error);
      throw new Error("Error finding all users");
    }
  }
  async findById(id: string): Promise<TUserOutputRequestDto | null> {
    try {
      const db = this.firebaseClient.getDb();
      const userDoc = await getDoc(doc(db, "users", id));
      if (!userDoc.exists()) {
        return null;
      }
      return { id: userDoc.id, ...userDoc.data() } as TUserOutputRequestDto;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  async findByEmail(email: string): Promise<TUserOutputRequestDto | null> {
    try {
      const db = this.firebaseClient.getDb();
      const userQuery = query(
        collection(db, "users"),
        where("email", "==", email)
      );
      const userSnapshot = await getDocs(userQuery);
      if (userSnapshot.empty) {
        return null;
      }
      const userDoc = userSnapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() } as TUserOutputRequestDto;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  async findByName(name: string): Promise<TUserOutputRequestDto[]> {
    try {
      const db = this.firebaseClient.getDb();
      const userQuery = query(
        collection(db, "users"),
        where("name", "==", name)
      );
      const userSnapshot = await getDocs(userQuery);
      if (userSnapshot.empty) {
        return [];
      }
      const users: TUserOutputRequestDto[] = [];
      userSnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as TUserOutputRequestDto);
      });
      return users;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}
