import { describe, expect, it } from "vitest";
import { isTautology } from "../src/solver.js";
import { normalizeAndSplitChars } from "../src/utils/text-utils.js";
import { buildHierarchy } from "../src/hierarchy.js";
import { parse } from "../src/ast.js";
import { AND, EQ, IMPL, NOT, OR } from "../src/constants.js";

const parseSentence = (sentence: string) => {
  const chars = normalizeAndSplitChars(sentence);
  const root = buildHierarchy(chars);
  return parse(root);
};

describe(isTautology.name, () => {
  describe("tautologies", () => {
    it("should return true for p ∨ ~p (law of excluded middle)", () => {
      const sentence = `p ${OR} ${NOT}p`;
      const parsed = parseSentence(sentence);
      expect(isTautology(parsed)).toBe(true);
    });

    it("should return true for ~(p ∧ ~p) (law of non-contradiction)", () => {
      const sentence = `${NOT}(p ${AND} ${NOT}p)`;
      const parsed = parseSentence(sentence);
      expect(isTautology(parsed)).toBe(true);
    });

    it("should return true for p → p (self-implication)", () => {
      const sentence = `p ${IMPL} p`;
      const parsed = parseSentence(sentence);
      expect(isTautology(parsed)).toBe(true);
    });

    it("should return true for p ≡ p (self-equivalence)", () => {
      const sentence = `p ${EQ} p`;
      const parsed = parseSentence(sentence);
      expect(isTautology(parsed)).toBe(true);
    });

    it("should return true for (p → q) → (~q → ~p) (contrapositive)", () => {
      const sentence = `(p ${IMPL} q) ${IMPL} (${NOT}q ${IMPL} ${NOT}p)`;
      const parsed = parseSentence(sentence);
      expect(isTautology(parsed)).toBe(true);
    });

    it("should return true for p → (q → p) (weakening)", () => {
      const sentence = `p ${IMPL} (q ${IMPL} p)`;
      const parsed = parseSentence(sentence);
      expect(isTautology(parsed)).toBe(true);
    });

    it("should return true for (p ∧ q) → p (conjunction elimination)", () => {
      const sentence = `(p ${AND} q) ${IMPL} p`;
      const parsed = parseSentence(sentence);
      expect(isTautology(parsed)).toBe(true);
    });

    it("should return true for p → (p ∨ q) (disjunction introduction)", () => {
      const sentence = `p ${IMPL} (p ${OR} q)`;
      const parsed = parseSentence(sentence);
      expect(isTautology(parsed)).toBe(true);
    });

    it("should return true for ((p → q) ∧ (q → r)) → (p → r) (hypothetical syllogism)", () => {
      const sentence = `((p ${IMPL} q) ${AND} (q ${IMPL} r)) ${IMPL} (p ${IMPL} r)`;
      const parsed = parseSentence(sentence);
      expect(isTautology(parsed)).toBe(true);
    });

    it("should return true for (p ∨ q) ≡ (~p → q) (material implication)", () => {
      const sentence = `(p ${OR} q) ${EQ} (${NOT}p ${IMPL} q)`;
      const parsed = parseSentence(sentence);
      expect(isTautology(parsed)).toBe(true);
    });

    it("should return true for (p ∧ q) ≡ ~(~p ∨ ~q) (De Morgan's law)", () => {
      const sentence = `(p ${AND} q) ${EQ} ${NOT}(${NOT}p ${OR} ${NOT}q)`;
      const parsed = parseSentence(sentence);
      expect(isTautology(parsed)).toBe(true);
    });

    it("should return true for (p ∨ q) ≡ ~(~p ∧ ~q) (De Morgan's law)", () => {
      const sentence = `(p ${OR} q) ${EQ} ${NOT}(${NOT}p ${AND} ${NOT}q)`;
      const parsed = parseSentence(sentence);
      expect(isTautology(parsed)).toBe(true);
    });
  });

  describe("non-tautologies", () => {
    it("should return false for a simple literal p", () => {
      const sentence = `p`;
      const parsed = parseSentence(sentence);
      expect(isTautology(parsed)).toBe(false);
    });

    it("should return false for p ∧ q", () => {
      const sentence = `p ${AND} q`;
      const parsed = parseSentence(sentence);
      expect(isTautology(parsed)).toBe(false);
    });

    it("should return false for p ∨ q", () => {
      const sentence = `p ${OR} q`;
      const parsed = parseSentence(sentence);
      expect(isTautology(parsed)).toBe(false);
    });

    it("should return false for p → q", () => {
      const sentence = `p ${IMPL} q`;
      const parsed = parseSentence(sentence);
      expect(isTautology(parsed)).toBe(false);
    });

    it("should return false for p ≡ q", () => {
      const sentence = `p ${EQ} q`;
      const parsed = parseSentence(sentence);
      expect(isTautology(parsed)).toBe(false);
    });

    it("should return false for ~p", () => {
      const sentence = `${NOT}p`;
      const parsed = parseSentence(sentence);
      expect(isTautology(parsed)).toBe(false);
    });

    it("should return false for p ∧ ~p (contradiction)", () => {
      const sentence = `p ${AND} ${NOT}p`;
      const parsed = parseSentence(sentence);
      expect(isTautology(parsed)).toBe(false);
    });

    it("should return false for (p → q) ∧ p (not modus ponens conclusion)", () => {
      const sentence = `(p ${IMPL} q) ${AND} p`;
      const parsed = parseSentence(sentence);
      expect(isTautology(parsed)).toBe(false);
    });
  });
});
