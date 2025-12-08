;; Machine Description for "something-risc" architecture
;; Defines instruction patterns (define_insn) and constraints.

;; --- Constraints and Predicates ---

;; Define a register class 'r' for general purpose registers
(define_register_constraint "r" "GENERAL_REGS"
  "General purpose registers (r0..r31).")

;; Define an immediate constraint 'I' for small integers
(define_constraint "I"
  "A signed 12-bit integer constant."
  (and (match_code "const_int")
       (match_test "ival >= -2048 && ival <= 2047")))

;; Basic predicate for general operands
(define_predicate "general_operand_something"
  (ior (match_operand 0 "register_operand")
       (match_operand 0 "const_int_operand")))


;; --- Data Movement Instructions ---

;; Move 32-bit integer (SImode)
(define_insn "movsi"
  [(set (match_operand:SI 0 "register_operand" "=r,r")
        (match_operand:SI 1 "general_operand"  "r,I"))]
  ""
  "@
   mv  %0, %1
   li  %0, %1"
  [(set_attr "type" "move")
   (set_attr "length" "4")])


;; --- Arithmetic Instructions ---

;; Addition: rA = rB + rC (or immediate)
(define_insn "addsi3"
  [(set (match_operand:SI 0 "register_operand" "=r,r")
        (plus:SI (match_operand:SI 1 "register_operand" "%r,r")
                 (match_operand:SI 2 "general_operand"  "r,I")))]
  ""
  "@
   add %0, %1, %2
   addi %0, %1, %2"
  [(set_attr "type" "alu")])

;; Subtraction: rA = rB - rC
(define_insn "subsi3"
  [(set (match_operand:SI 0 "register_operand" "=r")
        (minus:SI (match_operand:SI 1 "register_operand" "r")
                  (match_operand:SI 2 "register_operand" "r")))]
  ""
  "sub %0, %1, %2"
  [(set_attr "type" "alu")])

;; Logical AND
(define_insn "andsi3"
  [(set (match_operand:SI 0 "register_operand" "=r,r")
        (and:SI (match_operand:SI 1 "register_operand" "%r,r")
                (match_operand:SI 2 "general_operand" "r,I")))]
  ""
  "@
   and  %0, %1, %2
   andi %0, %1, %2"
  [(set_attr "type" "alu")])


;; --- Control Flow Instructions ---

;; Conditional Branch
;; Compare op1 and op2, jump to label if condition met.
(define_insn "cbranchsi4"
  [(set (pc)
        (if_then_else (match_operator 0 "comparison_operator"
                        [(match_operand:SI 1 "register_operand" "r")
                         (match_operand:SI 2 "register_operand" "r")])
                      (label_ref (match_operand 3 "" ""))
                      (pc)))]
  ""
  "b%C0 %1, %2, %l3"
  [(set_attr "type" "branch")])

;; Unconditional Jump
(define_insn "jump"
  [(set (pc)
        (label_ref (match_operand 0 "" "")))]
  ""
  "j %l0"
  [(set_attr "type" "branch")])

;; Function Call
(define_insn "call"
  [(call (mem:SI (match_operand:SI 0 "register_operand" "r"))
         (match_operand 1 "" ""))]
  ""
  "jalr %0"
  [(set_attr "type" "call")])

;; No-Operation
(define_insn "nop"
  [(const_int 0)]
  ""
  "nop"
  [(set_attr "type" "nop")])

;; End of something.md
